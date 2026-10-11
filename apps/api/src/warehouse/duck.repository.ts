import type { Pool } from 'mysql2/promise.js';
import { Inject } from '@nestjs/common';
import { HttpException } from '@nestjs/common';

type DuckRow = {
  id: number;
  color: string;
  size: string;
  price_cents: number;
  quantity: number;
  version: number;
};

export class DuckRepository {
  private readonly selectColumns = 'id, color, size, price_cents, quantity, version';

  constructor(@Inject('DB_POOL') private readonly pool: Pool) {}

  async upsert(color: string, size: string, priceCents: number, qty: number): Promise<void> {
    await this.pool.query(
      'INSERT INTO duck (color, size, price_cents, quantity) VALUES (?, ?, ?, ?) AS new ' +
      'ON DUPLICATE KEY UPDATE quantity = duck.quantity + new.quantity, version = duck.version + 1',
      [color, size, priceCents, qty],
    );
  }

  async findActive(
    color: string,
    size: string,
    priceCents: number,
  ): Promise<DuckRow | null> {
    const [rows] = await this.pool.query(
      `SELECT ${this.selectColumns} FROM duck WHERE color = ? AND size = ? AND price_cents = ? AND deleted = 0`,
      [color, size, priceCents],
    );
    return Array.isArray(rows) && rows.length > 0 ? (rows[0] as DuckRow) : null;
  }

  /**
   * Finds the lowest-priced active lot of the given color+size with quantity >= minQuantity.
   * One SQL query, no loops over all ducks.
   * Returns null if no such lot exists.
   */
  async findLowestPrice(color: string, size: string, minQuantity: number): Promise<number | null> {
    const normColor = color.toUpperCase();
    const normSize = size.toUpperCase();
    const [rows] = await this.pool.query(
      'SELECT price_cents FROM duck WHERE color = ? AND size = ? AND deleted = 0 AND quantity >= ? ' +
      'ORDER BY price_cents ASC LIMIT 1',
      [normColor, normSize, minQuantity],
    );
    const row = Array.isArray(rows) && rows.length > 0 ? rows[0] as DuckRow : null;
    return row ? row.price_cents : null;
  }

  async listActive(order: 'asc' | 'desc' = 'desc'): Promise<DuckRow[]> {
    const direction = order === 'asc' ? 'ASC' : 'DESC';
    const [rows] = await this.pool.query(
      `SELECT ${this.selectColumns} FROM duck WHERE deleted = 0 ORDER BY quantity ${direction}, id ASC`,
    );
    return Array.isArray(rows) ? rows : [];
  }

  async update(
    id: number,
    priceCents: number,
    quantity: number,
    version: number,
  ): Promise<DuckRow> {
    try {
      const [result] = await this.pool.query(
        'UPDATE duck SET price_cents = ?, quantity = ?, version = version + 1 WHERE id = ? AND deleted = 0 AND version = ?',
        [priceCents, quantity, id, version],
      );
      const affected = result.affectedRows as number;
      if (affected === 0) {
        await this.throwForMissingOrStale(id);
      }
      const [rows] = await this.pool.query(`SELECT ${this.selectColumns} FROM duck WHERE id = ?`, [id]);
      return Array.isArray(rows) && rows.length > 0 ? (rows[0] as DuckRow) : null;
    } catch (err) {
      if (err instanceof HttpException) throw err;
      const errCode = (err as { code?: unknown })?.code;
      if (errCode === 'ER_DUP_ENTRY' || errCode === 1062) {
        throw new HttpException(
          { code: 'DUPLICATE_DUCK', message: 'Duplicate duck', details: undefined },
          409,
        );
      }
      throw err;
    }
  }

  private async throwForMissingOrStale(id: number): Promise<never> {
    const [rows] = await this.pool.query('SELECT id, deleted FROM duck WHERE id = ?', [id]);
    const row = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
    if (!row || row.deleted === 1) {
      throw new HttpException(
        { code: 'NOT_FOUND', message: 'Duck not found', details: undefined },
        404,
      );
    }
    throw new HttpException(
      { code: 'STALE_VERSION', message: 'Stale version', details: undefined },
      409,
    );
  }

  async softDelete(id: number): Promise<void> {
    const [result] = await this.pool.query(
      'UPDATE duck SET deleted = 1, version = version + 1 WHERE id = ? AND deleted = 0',
      [id],
    );
    const affected = result.affectedRows as number;
    if (affected === 0) {
      throw new HttpException(
        { code: 'NOT_FOUND', message: 'Duck not found', details: undefined },
        404,
      );
    }
  }
}