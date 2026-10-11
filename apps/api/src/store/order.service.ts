import { Injectable, Inject } from '@nestjs/common';
import { Money } from '../domain/money.js';
import { packageFor, protectionFor } from '../domain/packaging.js';
import { PricingPipeline } from '../domain/pricing/pricing-pipeline.js';
import { PricingContext } from '../domain/pricing/pricing-context.js';
import { PriceResolver, LowestPriceResolver } from './price-resolver.js';
import { DuckRepository } from '../warehouse/duck.repository.js';

/** Result of an order quote. */
export interface OrderQuoteResult {
  package: string;
  protection: string[];
  unitPrice: number;
  lineItems: { code: string; label: string; amount: number }[];
  total: number;
  currency: 'USD';
}

/** Service that composes price resolution + package/protection + pricing pipeline. */
@Injectable()
export class OrderService {
  private readonly priceResolver: PriceResolver;

  constructor(
    private readonly duckRepository: DuckRepository,
  ) {
    this.priceResolver = new LowestPriceResolver(this.duckRepository);
  }

  async quote(
    color: string,
    size: string,
    quantity: number,
    destination: string,
    shippingMode: string,
  ): Promise<OrderQuoteResult> {
    // Resolve the lowest price among active ducks of the requested color+size with sufficient quantity
    const { price } = await this.priceResolver.resolve(color, size, quantity);

    // Determine package and protection
    const pkg = packageFor(size as any);
    const mode = shippingMode as any;
    const protection = protectionFor(mode, pkg);

    // Build pricing context
    const ctx: PricingContext = {
      unitPrice: price,
      quantity,
      pkg,
      destination,
      mode,
    };

    // Run the pricing pipeline
    const pipeline = new PricingPipeline();
    const result = pipeline.apply(ctx);

    // Build the response
    const lineItems = result.lineItems.map((item) => ({
      code: item.code,
      label: item.label,
      amount: item.amount.toDecimal(),
    }));

    return {
      package: pkg,
      protection,
      unitPrice: price.toDecimal(),
      lineItems,
      total: result.total.toDecimal(),
      currency: 'USD',
    };
  }
}