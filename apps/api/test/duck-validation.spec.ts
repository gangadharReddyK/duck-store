import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, App } from 'supertest/types.js';
import request from 'supertest';
import { configureApp } from '../src/common/app-setup.js';
import { DuckController } from '../src/warehouse/duck.controller.js';
import { DuckService } from '../src/warehouse/duck.service.js';

class MockDuckService {
  add = () => ({});
}

describe('DuckValidation', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [DuckController],
      providers: [{ provide: DuckService, useClass: MockDuckService }],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('rejects bad enum color', async () => {
    return request(app.getHttpServer())
      .post('/api/v1/ducks')
      .send({ color: 'Purple', size: 'Large', price: 10.0, quantity: 5 })
      .expect(400)
      .expect((res) => {
        expect(res.body.code).toBe('VALIDATION_ERROR');
      });
  });

  it('rejects price with 3 decimals', async () => {
    return request(app.getHttpServer())
      .post('/api/v1/ducks')
      .send({ color: 'Red', size: 'Large', price: 1.234, quantity: 5 })
      .expect(400)
      .expect((res) => {
        expect(res.body.code).toBe('VALIDATION_ERROR');
      });
  });

  it('rejects unknown field', async () => {
    return request(app.getHttpServer())
      .post('/api/v1/ducks')
      .send({ color: 'Red', size: 'Large', price: 10.0, quantity: 5, extra: true })
      .expect(400)
      .expect((res) => {
        expect(res.body.code).toBe('VALIDATION_ERROR');
      });
  });

  it('rejects quantity 0 on create', async () => {
    return request(app.getHttpServer())
      .post('/api/v1/ducks')
      .send({ color: 'Red', size: 'Large', price: 10.0, quantity: 0 })
      .expect(400)
      .expect((res) => {
        expect(res.body.code).toBe('VALIDATION_ERROR');
      });
  });
});