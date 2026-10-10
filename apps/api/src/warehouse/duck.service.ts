import { Injectable, Inject } from '@nestjs/common';
import { DuckRepository } from './duck.repository.js';
import { CreateDuckDto } from './dto/create-duck.dto.js';
import { DuckResponse } from './dto/duck-response.dto.js';
import { Color, Size } from '../common/enums.js';

@Injectable()
export class DuckService {
  constructor(
    @Inject('DB_POOL')
    private readonly pool: any,
    private readonly duckRepository: DuckRepository,
  ) {}

  async add(dto: CreateDuckDto): Promise<{ duck: DuckResponse; merged: boolean }> {
    const priceCents = Math.round(dto.price * 100);

    await this.duckRepository.upsert(dto.color, dto.size, priceCents, dto.quantity);
    const row = await this.duckRepository.findActive(dto.color, dto.size, priceCents);

    if (!row) {
      throw new Error('Failed to find active duck after upsert');
    }

    const merged = row.version > 0;
    const duck: DuckResponse = {
      id: row.id,
      color: row.color as Color,
      size: row.size as Size,
      price: row.price_cents / 100,
      quantity: row.quantity,
      version: row.version,
    };

    return { duck, merged };
  }
}