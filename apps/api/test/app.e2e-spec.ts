import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { getApp, stop } from './support/test-app.js'; // Ensure path matches your support file

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await getApp();
  }, 120000);

  afterAll(async () => {
    await stop();
  }, 120000);

  it('/api (GET) -> 404, not versioned', () => {
    return request(app.getHttpServer())
      .get('/api')
      .expect(404);
  });

  it('/api/v1 (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1')
      .expect(200)
      .expect('Hello World!');
  });
});