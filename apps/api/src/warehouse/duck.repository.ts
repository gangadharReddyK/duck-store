import type { Pool } from 'mysql2/promise.js';
import { Inject } from '@nestjs/common';

export class DuckRepository {
  constructor(@Inject('DB_POOL') private readonly pool: Pool) {}

  async upsert(color: string, size: string, priceCents: number, qty: number): Promise<void> {
    await this.pool.query(
      'INSERT INTO duck (color, size, price_cents, quantity) VALUES (?, ?, ?, ?) AS new ' +
      'ON DUPLICATE KEY UPDATE quantity = duck.quantity + new.quantity, version = duck.version + 1',
      [color, size, priceCents, qty],
    );
  }

  async findActive(color: string, size: string, priceCents: number): Promise<{
    id: number;
    color: string;
    size: string;
    price_cents: number;
    quantity: number;
    deleted: number;
    version: number;
  } | null> {
    const [rows] = await this.pool.query(
      'SELECT * FROM duck WHERE color = ? AND size = ? AND price_cents = ? AND deleted = 0',
      [color, size, priceCents],
    );
    return Array.isArray(rows) && rows.length > 0 ? (rows[0] as any) : null;
  }
}