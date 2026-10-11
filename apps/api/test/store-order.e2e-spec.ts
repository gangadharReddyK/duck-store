import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { getApp, query, clearDucks, stop } from './support/test-app.js';

describe('POST /api/store/orders', () => {
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

  const postOrder = (body: Record<string, any>) =>
    request(app.getHttpServer()).post('/api/store/orders').send(body);

  const postDuck = (color: string, size: string, price: number, quantity: number) =>
    request(app.getHttpServer()).post('/api/ducks').send({ color, size, price, quantity });

  describe('200 - valid order', () => {
    test('Large @5.00 Air India = 6992.00 (WOOD, [POLYSTYRENE_BALLS], 5 line items)', async () => {
      // Create ducks: Large Red @5.00 qty 200 (eligible)
      await postDuck('Red', 'Large', 5.00, 200).expect(201);
      // Also create a cheaper duck of same color+size but with insufficient quantity
      await postDuck('Red', 'Large', 4.50, 50).expect(201); // too-small lot
      // And a deleted lot of same color+size (should be ignored)
      const deleted = await postDuck('Red', 'Large', 4.00, 300).expect(201);
      await request(app.getHttpServer()).delete(`/api/ducks/${deleted.body.id}`).expect(204);

      const res = await postOrder({
        color: 'red', // lowercase accepted
        size: 'large',
        quantity: 200,
        destination: 'India',
        shippingMode: 'air', // lowercase accepted
      }).expect(200);

      expect(res.body).toMatchObject({
        package: 'WOOD',
        protection: ['POLYSTYRENE_BALLS'],
        unitPrice: 5.00,
        currency: 'USD',
        total: 6992.00,
      });
      expect(res.body.lineItems).toHaveLength(5);
      expect(res.body.lineItems.map((l: any) => l.code)).toEqual([
        'BASE',
        'VOLUME_DISCOUNT',
        'PACKAGE',
        'DESTINATION',
        'SHIPPING',
      ]);
    });

    test('lowest eligible lot chosen when multiple lots exist', async () => {
      // Two active lots of same color+size with different prices
      await postDuck('Green', 'Medium', 10.00, 50).expect(201);
      await postDuck('Green', 'Medium', 8.00, 50).expect(201); // cheaper

      const res = await postOrder({
        color: 'Green',
        size: 'Medium',
        quantity: 50,
        destination: 'USA',
        shippingMode: 'Sea',
      }).expect(200);

      // Should pick the 8.00 lot (cheapest with sufficient quantity)
      expect(res.body.unitPrice).toBe(8.00);
    });

    test('too-small lot is skipped', async () => {
      await postDuck('Green', 'Small', 2.00, 10).expect(201); // insufficient for qty 20
      await postDuck('Green', 'Small', 2.50, 30).expect(201); // sufficient

      const res = await postOrder({
        color: 'Green',
        size: 'Small',
        quantity: 20,
        destination: 'Bolivia',
        shippingMode: 'Land',
      }).expect(200);

      expect(res.body.unitPrice).toBe(2.50);
    });

    test('deleted lots are ignored', async () => {
      await postDuck('Yellow', 'XLarge', 15.00, 100).expect(201);
      const deleted = await postDuck('Yellow', 'XLarge', 12.00, 200).expect(201);
      await request(app.getHttpServer()).delete(`/api/ducks/${deleted.body.id}`).expect(204);

      const res = await postOrder({
        color: 'Yellow',
        size: 'XLarge',
        quantity: 50,
        destination: 'Other',
        shippingMode: 'Sea',
      }).expect(200);

      expect(res.body.unitPrice).toBe(15.00);
    });
  });

  describe('409 INSUFFICIENT_STOCK', () => {
    test('active ducks exist but none have sufficient quantity', async () => {
      await postDuck('Red', 'Medium', 10.00, 50).expect(201);
      await postDuck('Red', 'Medium', 9.00, 30).expect(201);

      await postOrder({
        color: 'Red',
        size: 'Medium',
        quantity: 100, // need 100, max available is 50
        destination: 'USA',
        shippingMode: 'Air',
      }).expect(409).expect((res) => expect(res.body.code).toBe('INSUFFICIENT_STOCK'));
    });
  });

  describe('404 NO_MATCHING_DUCK', () => {
    test('valid color but no ducks of that color+size exist', async () => {
      await postDuck('Red', 'Large', 10.00, 100).expect(201);

      await postOrder({
        color: 'Green', // valid color but no Green+Large ducks exist
        size: 'Large',
        quantity: 10,
        destination: 'USA',
        shippingMode: 'Air',
      }).expect(404).expect((res) => expect(res.body.code).toBe('NO_MATCHING_DUCK'));
    });

    test('known color but unknown size', async () => {
      await postDuck('Red', 'Large', 10.00, 100).expect(201);

      await postOrder({
        color: 'Red',
        size: 'XXLarge', // unknown size
        quantity: 10,
        destination: 'USA',
        shippingMode: 'Air',
      }).expect(400).expect((res) => expect(res.body.code).toBe('VALIDATION_ERROR'));
    });
  });

  describe('400 VALIDATION_ERROR', () => {
    test('bad color enum', async () => {
      await postOrder({
        color: 'Pink',
        size: 'Large',
        quantity: 10,
        destination: 'USA',
        shippingMode: 'Air',
      }).expect(400).expect((res) => expect(res.body.code).toBe('VALIDATION_ERROR'));
    });

    test('bad size enum', async () => {
      await postOrder({
        color: 'Red',
        size: 'Huge',
        quantity: 10,
        destination: 'USA',
        shippingMode: 'Air',
      }).expect(400).expect((res) => expect(res.body.code).toBe('VALIDATION_ERROR'));
    });

    test('bad shippingMode enum', async () => {
      await postOrder({
        color: 'Red',
        size: 'Large',
        quantity: 10,
        destination: 'USA',
        shippingMode: 'Rocket',
      }).expect(400).expect((res) => expect(res.body.code).toBe('VALIDATION_ERROR'));
    });

    test('quantity < 1', async () => {
      await postOrder({
        color: 'Red',
        size: 'Large',
        quantity: 0,
        destination: 'USA',
        shippingMode: 'Air',
      }).expect(400).expect((res) => expect(res.body.code).toBe('VALIDATION_ERROR'));
    });

    test('empty destination', async () => {
      await postOrder({
        color: 'Red',
        size: 'Large',
        quantity: 10,
        destination: '',
        shippingMode: 'Air',
      }).expect(400).expect((res) => expect(res.body.code).toBe('VALIDATION_ERROR'));
    });

    test('unknown field rejected', async () => {
      await postOrder({
        color: 'Red',
        size: 'Large',
        quantity: 10,
        destination: 'USA',
        shippingMode: 'Air',
        extra: 'field',
      }).expect(400).expect((res) => expect(res.body.code).toBe('VALIDATION_ERROR'));
    });
  });

  describe('case-insensitive enums', () => {
    test('lowercase "air" accepted', async () => {
      await postDuck('Red', 'Large', 5.00, 200).expect(201);

      const res = await postOrder({
        color: 'red',
        size: 'large',
        quantity: 200,
        destination: 'india',
        shippingMode: 'air',
      }).expect(200);

      expect(res.body.total).toBe(6992.00);
    });

    test('uppercase "AIR" accepted', async () => {
      await postDuck('Red', 'Large', 5.00, 200).expect(201);

      const res = await postOrder({
        color: 'RED',
        size: 'LARGE',
        quantity: 200,
        destination: 'INDIA',
        shippingMode: 'AIR',
      }).expect(200);

      expect(res.body.total).toBe(6992.00);
    });
  });
});