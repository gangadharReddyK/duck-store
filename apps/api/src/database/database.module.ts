import { Global, Module } from '@nestjs/common';
import { SCHEMA_SQL } from './schema.js';

let pool: any = null;

@Global()
@Module({
  providers: [
    {
      provide: 'DB_POOL',
      useFactory: async () => {
        if (pool) {
          return pool;
        }
        const mysql = await import('mysql2/promise');
        const p = mysql.createPool({
          host: process.env.DB_HOST ?? 'localhost',
          port: parseInt(process.env.DB_PORT ?? '3307', 10),
          user: process.env.DB_USER ?? 'root',
          password: process.env.DB_PASSWORD ?? 'root',
          database: process.env.DB_NAME ?? 'duckstore',
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0,
        });
        pool = p;
        // Initialize schema
        const connection = await p.getConnection();
        try {
          await connection.query(SCHEMA_SQL);
        } finally {
          connection.release();
        }
        return p;
      },
    },
  ],
  exports: ['DB_POOL'],
})
export class DatabaseModule {}
