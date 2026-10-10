import { Test, TestingModule } from '@nestjs/testing';
import { NestApplication, INestApplication } from '@nestjs/common';
import { StartedMySqlContainer, MySqlContainer } from '@testcontainers/mysql';
import { AppModule } from '../../src/app.module.js';
import { configureApp } from '../../src/common/app-setup.js';
import request from 'supertest';
import mysql from 'mysql2/promise';

let container: StartedMySqlContainer;
let app: INestApplication;

// Schema SQL from database/schema.ts
const SCHEMA_SQL = `CREATE TABLE IF NOT EXISTS duck (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  color       ENUM('Red','Green','Yellow','Black') NOT NULL,
  size        ENUM('XLarge','Large','Medium','Small','XSmall') NOT NULL,
  price_cents INT UNSIGNED NOT NULL,
  quantity    INT UNSIGNED NOT NULL,
  deleted     TINYINT(1) NOT NULL DEFAULT 0,
  version     INT NOT NULL DEFAULT 0,
  active_key  TINYINT GENERATED ALWAYS AS (IF(deleted = 0, 1, NULL)) STORED,
  UNIQUE KEY uq_active_duck (color, size, price_cents, active_key)
)`;

/** Wait until the MySQL server is ready to accept connections. */
async function waitForDatabaseReady(
  host: string,
  port: number,
  user: string,
  password: string,
  database: string,
  maxAttempts = 30,
  interval = 1000,
): Promise<void> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const connection = await mysql.createConnection({
        host,
        port,
        user,
        password,
      });
      await connection.ping();
      await connection.end();
      // Verify the database exists
      const conn2 = await mysql.createConnection({
        host,
        port,
        user,
        password,
        database,
      });
      await conn2.ping();
      await conn2.end();
      return;
    } catch {
      // Try again after interval
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  }
  throw new Error('Database is not ready after waiting');
}

export async function setupDatabase() {
  container = await new MySqlContainer('mysql:8.4')
    .withDatabase('duckstore')
    .withRootPassword('root')
    .start();

  process.env.DB_HOST = container.getHost();
  process.env.DB_PORT = String(container.getMappedPort(3306));
  process.env.DB_USER = 'root';
  process.env.DB_PASSWORD = 'root';
  process.env.DB_NAME = 'duckstore';

  console.log('Database container started:', container.getHost(), container.getMappedPort(3306));

  // Wait for the database to be ready before proceeding
  await waitForDatabaseReady(
    process.env.DB_HOST!,
    parseInt(process.env.DB_PORT!, 10),
    process.env.DB_USER!,
    process.env.DB_PASSWORD!,
    process.env.DB_NAME!,
  );
  console.log('Database is ready');

  // Initialize schema
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3307', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  try {
    await connection.query(SCHEMA_SQL);
    console.log('Schema initialized');
  } finally {
    await connection.end();
  }
}

export async function createApp(): Promise<INestApplication> {
  console.log('Creating app...');
  // Make sure database is set up first
  await setupDatabase();

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  console.log('App module compiled');
  app = moduleFixture.createNestApplication();
  configureApp(app);
  await app.init();
  console.log('App initialized');

  return app;
}

export async function getApp(): Promise<INestApplication> {
  if (!app) {
    await createApp();
  }
  return app;
}

export async function query(sql: string, params?: any[]): Promise<any> {
  const dbConfig = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3307', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  };
  const connection = await mysql.createConnection(dbConfig);
  try {
    const [rows] = await connection.execute(sql, params);
    return rows;
  } finally {
    await connection.end();
  }
}

export async function clearDucks() {
  await query('DELETE FROM duck');
  await query('ALTER TABLE duck AUTO_INCREMENT = 1');
}

export async function stop() {
  if (app) {
    await app.close();
  }
  if (container) {
    await container.stop();
  }
}