import { Injectable, Inject } from '@nestjs/common';
import { DuckRepository } from './duck.repository.js';
import { CreateDuckDto } from './dto/create-duck.dto.js';
import { UpdateDuckDto } from './dto/update-duck.dto.js';
import { Color, Size } from '../common/enums.js';

@Injectable()
export class DuckService {
  constructor(
    @Inject('DB_POOL')
    private readonly pool: any,
    private readonly duckRepository: DuckRepository,
  ) {}

  async add(dto: CreateDuckDto): Promise<{ duck: any; merged: boolean }> {
    const priceCents = Math.round(dto.price * 100);

    await this.duckRepository.upsert(dto.color, dto.size, priceCents, dto.quantity);
    const row = await this.duckRepository.findActive(dto.color, dto.size, priceCents);

    if (!row) {
      throw new Error('Failed to find active duck after upsert');
    }

    const merged = row.version > 0;
    const duck = {
      id: row.id,
      color: row.color as Color,
      size: row.size as Size,
      price: row.price_cents / 100,
      quantity: row.quantity,
      version: row.version,
    };

    return { duck, merged };
  }

  async list(order?: 'asc' | 'desc'): Promise<any[]> {
    const rows = await this.duckRepository.listActive(order ?? 'desc');
    return rows.map(row => ({
      id: row.id,
      color: row.color as Color,
      size: row.size as Size,
      price: row.price_cents / 100,
      quantity: row.quantity,
      version: row.version,
    }));
  }

  async update(id: number, dto: UpdateDuckDto): Promise<any> {
    const priceCents = Math.round(dto.price * 100);
    const row = await this.duckRepository.update(id, priceCents, dto.quantity, dto.version);
    return {
      id: row.id,
      color: row.color as Color,
      size: row.size as Size,
      price: row.price_cents / 100,
      quantity: row.quantity,
      version: row.version,
    };
  }

  async delete(id: number): Promise<void> {
    await this.duckRepository.softDelete(id);
  }
}