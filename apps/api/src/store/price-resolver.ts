import { Money } from '../domain/money.js';
import { PriceResolutionResult } from './price-resolver.types.js';
import { HttpException } from '@nestjs/common';
import { DuckRepository } from '../warehouse/duck.repository.js';

/** Resolves the lowest-priced active duck for the given color+size and minimum quantity. */
export interface PriceResolver {
  resolve(color: string, size: string, quantity: number): Promise<PriceResolutionResult>;
}

/** Implementation of {@link PriceResolver} backed by a DuckRepository query. */
export class LowestPriceResolver implements PriceResolver {
  constructor(private readonly duckRepository: DuckRepository) {}

  async resolve(color: string, size: string, quantity: number): Promise<PriceResolutionResult> {
    const normalizedColor = color.toLowerCase();
    const normalizedSize = size.toLowerCase();

    const priceCents = await this.duckRepository.findLowestPrice(normalizedColor, normalizedSize, quantity);
    
    if (priceCents !== null) {
      return { price: new Money(priceCents) };
    }
    
    // Check if any active duck exists with this color+size to distinguish 404 vs 409
    const [anyRows] = await this.duckRepository.pool.query(
      'SELECT 1 FROM duck WHERE LOWER(color) = ? AND LOWER(size) = ? AND deleted = 0 LIMIT 1',
      [normalizedColor, normalizedSize]
    );
    
    const hasAnyActiveDuck = Array.isArray(anyRows) && anyRows.length > 0;
    
    if (!hasAnyActiveDuck) {
      throw new HttpException(
        { code: 'NO_MATCHING_DUCK', message: 'No matching duck found' },
        404
      );
    } else {
      throw new HttpException(
        { code: 'INSUFFICIENT_STOCK', message: 'Insufficient stock' },
        409
      );
    }
  }
}