import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { getApp, query, clearDucks, stop } from './support/test-app.js';

describe('Duck Merge Invariant', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await getApp();
  }, 120000);

  afterAll(async () => {
    await stop();
  }, 120000);

  beforeEach(async () => {
    await clearDucks();
  }, 60000);

  test('same color+size+price posted twice -> exactly one row, quantities summed, second response is 200', async () => {
    const response1 = await request(app.getHttpServer())
      .post('/api/ducks')
      .send({ color: 'Red', size: 'Large', price: 10.0, quantity: 5 });

    expect(response1.status).toBe(201);
    expect(response1.body.quantity).toBe(5);
    expect(response1.body.version).toBe(0);

    const response2 = await request(app.getHttpServer())
      .post('/api/ducks')
      .send({ color: 'Red', size: 'Large', price: 10.0, quantity: 5 });

    expect(response2.status).toBe(200);
    expect(response2.body.quantity).toBe(10);
    expect(response2.body.version).toBe(1);

    const rows = await query('SELECT * FROM duck WHERE color = ? AND size = ? AND price_cents = ?', ['Red', 'Large', 1000]);

    expect(rows.length).toBe(1);
    expect(rows[0].quantity).toBe(10); // 5 + 5 = 10
  });

  test('same color+size, different price -> two rows', async () => {
    await request(app.getHttpServer())
      .post('/api/ducks')
      .send({ color: 'Red', size: 'Large', price: 10.0, quantity: 5 });

    await request(app.getHttpServer())
      .post('/api/ducks')
      .send({ color: 'Red', size: 'Large', price: 20.0, quantity: 3 });

    const rows = await query('SELECT color, size, price_cents, quantity FROM duck WHERE color = ? AND size = ?', ['Red', 'Large']);

    expect(rows.length).toBe(2);
    const prices = rows.map((r: any) => r.price_cents).sort();
    expect(prices).toEqual([1000, 2000]);
  });

  test('50 parallel POSTs (Promise.all) of the same duck with quantity 1 -> exactly one row, quantity 50', async () => {
    const payload = { color: 'Green', size: 'Medium', price: 5.0, quantity: 1 };
    const responses = await Promise.all(
      Array(50).fill(payload).map(p => request(app.getHttpServer()).post('/api/ducks').send(p)),
    );

    expect(responses.every(r => [201, 200].includes(r.status))).toBe(true);

    const rows = await query('SELECT * FROM duck WHERE color = ? AND size = ? AND price_cents = ?', ['Green', 'Medium', 500]);

    expect(rows.length).toBe(1);
    expect(rows[0].quantity).toBe(50);
  });

  test('mark a row deleted via SQL, then POST the same duck -> a new active row, deleted row remains', async () => {
    const res1 = await request(app.getHttpServer())
      .post('/api/ducks')
      .send({ color: 'Yellow', size: 'Small', price: 3.0, quantity: 4 });

    const rows = await query('SELECT * FROM duck WHERE color = ? AND size = ? AND price_cents = ?', ['Yellow', 'Small', 300]);

    expect(rows.length).toBe(1);
    expect(rows[0].deleted).toBe(0);
    const deletedRowId = rows[0].id;

    await query('UPDATE duck SET deleted = 1 WHERE id = ?', [deletedRowId]);

    const res2 = await request(app.getHttpServer())
      .post('/api/ducks')
      .send({ color: 'Yellow', size: 'Small', price: 3.0, quantity: 4 });

    expect(res2.status).toBe(201);
    expect(res2.body.quantity).toBe(4);
    expect(res2.body.version).toBe(0);

    const allRows = await query(
      'SELECT color, size, price_cents, quantity, deleted FROM duck WHERE color = ? AND size = ? AND price_cents = ?',
      ['Yellow', 'Small', 300],
    );

    expect(allRows.length).toBe(2);
    expect(allRows.some((r: any) => r.deleted === 0)).toBe(true);
    expect(allRows.some((r: any) => r.deleted === 1)).toBe(true);
  });
});
