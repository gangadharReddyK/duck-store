import type { Money } from '../money.js';
import { PricingContext, LineItem } from './pricing-context.js';

/**
 * A pricing rule that can be applied to a pricing context.
 * Each rule returns an array of line items.
 * The subtotal is the running total before this rule is applied.
 */
export interface PricingRule {
  apply(ctx: PricingContext, subtotal: Money): LineItem[];
}