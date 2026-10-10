import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { getApp, query, clearDucks, stop } from './support/test-app.js';

describe('Duck CRUD (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await getApp();
  }, 120000);

  afterEach(async () => {
    await clearDucks();
  }, 60000);

  afterAll(async () => {
    await stop();
  }, 120000);

  const post = (color: string, size: string, price: number, quantity: number) =>
    request(app.getHttpServer())
      .post('/api/ducks')
      .send({ color, size, price, quantity });

  describe('GET list with sorting', () => {
    test('empty list returns []', async () => {
      const res = await request(app.getHttpServer()).get('/api/ducks').expect(200);
      expect(res.body).toEqual([]);
    });

    test('default order is quantity desc with id asc tie-break', async () => {
      await post('Red', 'Large', 10.0, 10);
      await post('Green', 'Medium', 10.0, 10);
      await post('Black', 'Small', 10.0, 5);

      const res = await request(app.getHttpServer()).get('/api/ducks').expect(200);
      const quantities = res.body.map((d: any) => d.quantity);
      const ids = res.body.map((d: any) => d.id);
      expect(quantities).toEqual([10, 10, 5]);
      // tie-break: equal quantity rows keep ascending id order
      expect(ids).toEqual([...ids].sort((a: number, b: number) => a - b));
    });

    test('order=asc sorts ascending with id asc tie-break', async () => {
      await post('Red', 'Large', 10.0, 10);
      await post('Green', 'Medium', 10.0, 10);
      await post('Black', 'Small', 10.0, 5);

      const res = await request(app.getHttpServer()).get('/api/ducks?order=asc').expect(200);
      const quantities = res.body.map((d: any) => d.quantity);
      expect(quantities).toEqual([5, 10, 10]);
    });

    test('order=desc explicit sorts descending', async () => {
      await post('Red', 'Large', 10.0, 3);
      await post('Green', 'Medium', 10.0, 8);
      await post('Black', 'Small', 10.0, 1);

      const res = await request(app.getHttpServer()).get('/api/ducks?order=desc').expect(200);
      const quantities = res.body.map((d: any) => d.quantity);
      expect(quantities).toEqual([8, 3, 1]);
    });

    test('invalid sort value -> 400 VALIDATION_ERROR', async () => {
      await request(app.getHttpServer())
        .get('/api/ducks?sort=color')
        .expect(400)
        .expect((res) => expect(res.body.code).toBe('VALIDATION_ERROR'));
    });

    test('invalid order value -> 400 VALIDATION_ERROR', async () => {
      await request(app.getHttpServer())
        .get('/api/ducks?order=sideways')
        .expect(400)
        .expect((res) => expect(res.body.code).toBe('VALIDATION_ERROR'));
    });
  });

  describe('GET excludes deleted rows but keeps them', () => {
    test('soft-deleted duck not listed; row still kept in DB', async () => {
      const created = await post('Red', 'Large', 10.0, 5).expect(201);
      const id = created.body.id;

      await request(app.getHttpServer()).delete(`/api/ducks/${id}`).expect(204);

      const listed = await request(app.getHttpServer()).get('/api/ducks').expect(200);
      expect(listed.body).toEqual([]);

      const rows = await query('SELECT id, deleted FROM duck WHERE id = ?', [id]);
      expect(rows.length).toBe(1);
      expect(rows[0].deleted).toBe(1);
    });
  });

  describe('PUT edit', () => {
    test('updates price and quantity and bumps version', async () => {
      const created = await post('Red', 'Large', 10.0, 5).expect(201);
      const id = created.body.id;
      const version = created.body.version;

      const updated = await request(app.getHttpServer())
        .put(`/api/ducks/${id}`)
        .send({ price: 12.5, quantity: 9, version })
        .expect(200);

      expect(updated.body.price).toBe(12.5);
      expect(updated.body.quantity).toBe(9);
      expect(updated.body.version).toBe(version + 1);
    });

    test('stale version -> 409 STALE_VERSION', async () => {
      const created = await post('Red', 'Large', 10.0, 5).expect(201);
      const id = created.body.id;
      const version = created.body.version;

      await request(app.getHttpServer())
        .put(`/api/ducks/${id}`)
        .send({ price: 12.5, quantity: 9, version })
        .expect(200);

      await request(app.getHttpServer())
        .put(`/api/ducks/${id}`)
        .send({ price: 99.0, quantity: 1, version })
        .expect(409)
        .expect((res) => expect(res.body.code).toBe('STALE_VERSION'));
    });

    test('edit into an existing combination -> 409 DUPLICATE_DUCK', async () => {
      const a = await post('Red', 'Large', 10.0, 5).expect(201);
      const b = await post('Red', 'Large', 20.0, 3).expect(201);

      await request(app.getHttpServer())
        .put(`/api/ducks/${b.body.id}`)
        .send({ price: 10.0, quantity: 3, version: b.body.version })
        .expect(409)
        .expect((res) => expect(res.body.code).toBe('DUPLICATE_DUCK'));
    });

    test('color/size in body -> 400 VALIDATION_ERROR', async () => {
      const created = await post('Red', 'Large', 10.0, 5).expect(201);
      const id = created.body.id;

      await request(app.getHttpServer())
        .put(`/api/ducks/${id}`)
        .send({ color: 'Blue', size: 'Large', price: 10.0, quantity: 5, version: created.body.version })
        .expect(400)
        .expect((res) => expect(res.body.code).toBe('VALIDATION_ERROR'));
    });
  });

  describe('DELETE soft delete', () => {
    test('existing duck -> 204', async () => {
      const created = await post('Red', 'Large', 10.0, 5).expect(201);
      await request(app.getHttpServer()).delete(`/api/ducks/${created.body.id}`).expect(204);
    });

    test('delete twice -> 404 NOT_FOUND', async () => {
      const created = await post('Red', 'Large', 10.0, 5).expect(201);
      const id = created.body.id;

      await request(app.getHttpServer()).delete(`/api/ducks/${id}`).expect(204);
      await request(app.getHttpServer())
        .delete(`/api/ducks/${id}`)
        .expect(404)
        .expect((res) => expect(res.body.code).toBe('NOT_FOUND'));
    });

    test('delete unknown id -> 404 NOT_FOUND', async () => {
      await request(app.getHttpServer())
        .delete('/api/ducks/9999')
        .expect(404)
        .expect((res) => expect(res.body.code).toBe('NOT_FOUND'));
    });
  });
});
