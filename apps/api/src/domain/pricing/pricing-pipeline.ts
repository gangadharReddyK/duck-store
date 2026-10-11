import { Money } from '../money.js';
import { PricingContext, LineItem } from './pricing-context.js';
import { PricingRule } from './pricing-rule.js';
import {
  BaseRule,
  VolumeDiscountRule,
  PackageRule,
  DestinationRule,
  ShippingRule,
  AirBulkDiscountRule,
} from './rules.js';

export interface PricingResult {
  lineItems: LineItem[];
  total: Money;
}

/**
 * Pricing pipeline that runs pricing rules in order.
 *
 * Order:
 * 1. BaseRule: BASE = qty x unit price
 * 2. VolumeDiscountRule: -20% of BASE when qty > 100 → subtotal S = BASE + discount
 * 3. PackageRule: pct of S (not compounded)
 * 4. DestinationRule: pct of S (not compounded)
 * 5. ShippingRule: fixed/per-unit
 * 6. AirBulkDiscountRule: -15% of the AIR line when qty > 1000
 */
export class PricingPipeline {
  private readonly baseRule: BaseRule;
  private readonly volumeDiscountRule: VolumeDiscountRule;
  private readonly packageRule: PackageRule;
  private readonly destinationRule: DestinationRule;
  private readonly shippingRule: ShippingRule;
  private readonly airBulkDiscountRule: AirBulkDiscountRule;

  constructor() {
    this.baseRule = new BaseRule();
    this.volumeDiscountRule = new VolumeDiscountRule();
    this.packageRule = new PackageRule();
    this.destinationRule = new DestinationRule();
    this.shippingRule = new ShippingRule();
    this.airBulkDiscountRule = new AirBulkDiscountRule();
  }

  /**
   * Compute the quote.
   * Each line is rounded to cents (via Money.percentOf / Money.fromDecimal).
   * Total = sum of all line items.
   */
  apply(ctx: PricingContext): PricingResult {
    const lineItems: LineItem[] = [];

    // 1. BaseRule: BASE = qty x unit price
    const baseItems = this.baseRule.apply(ctx, new Money(0));
    lineItems.push(...baseItems);
    const baseAmount = baseItems[0].amount;

    // 2. VolumeDiscountRule: -20% of BASE when qty > 100 → applied to BASE
    const volumeItems = this.volumeDiscountRule.apply(ctx, baseAmount);
    lineItems.push(...volumeItems);
    const volumeAmount = volumeItems.length > 0 ? volumeItems[0].amount : new Money(0);

    // Subtotal S = BASE + volume discount
    const subtotalS = baseAmount.plus(volumeAmount);

    // 3. PackageRule: pct of S (not compounded)
    const packageItems = this.packageRule.apply(ctx, subtotalS);
    lineItems.push(...packageItems);

    // 4. DestinationRule: pct of S (not compounded)
    const destinationItems = this.destinationRule.apply(ctx, subtotalS);
    lineItems.push(...destinationItems);

    // 5. ShippingRule: fixed/per-unit (not based on S)
    const shippingItems = this.shippingRule.apply(ctx, new Money(0));
    lineItems.push(...shippingItems);

    // 6. AirBulkDiscountRule: -15% of the AIR line when qty > 1000
    const airBulkItems = this.airBulkDiscountRule.apply(ctx, new Money(0));
    lineItems.push(...airBulkItems);

    // Calculate total as sum of all line items
    const total = lineItems.reduce((sum, item) => sum.plus(item.amount), new Money(0));

    return { lineItems, total };
  }
}