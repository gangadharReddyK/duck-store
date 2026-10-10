import { Global, Module } from '@nestjs/common';
import { config } from './config.js';
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
          host: config.dbHost,
          port: config.dbPort,
          user: config.dbUser,
          password: config.dbPassword,
          database: config.dbName,
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
