import { Money } from '../money.js';
import { PackageType, ShippingMode } from '../types.js';
import { PricingContext, LineItem } from './pricing-context.js';
import { PricingRule } from './pricing-rule.js';

/**
 * Base rule: BASE = qty x unit price.
 */
export class BaseRule implements PricingRule {
  apply(ctx: PricingContext, _subtotal: Money): LineItem[] {
    const base = ctx.unitPrice.times(ctx.quantity);
    return [{ code: 'BASE', label: 'Base price', amount: base }];
  }
}

/**
 * Volume discount: -20% of BASE when qty > 100.
 * BASE = qty * unit price.
 * Subtotal S = BASE + discount.
 */
export class VolumeDiscountRule implements PricingRule {
  apply(ctx: PricingContext, subtotal: Money): LineItem[] {
    if (ctx.quantity <= 100 || subtotal.cents === 0) {
      return [];
    }

    // subtotal is BASE at this point (after BaseRule)
    const discount = subtotal.percentOf(-2000); // -20% = -2000 basis points
    return [{ code: 'VOLUME_DISCOUNT', label: 'Volume discount', amount: discount }];
  }
}

/**
 * Package surcharge/discount: WOOD +5% of S, PLASTIC +10% of S, CARDBOARD -1% of S.
 * Applied on the discounted subtotal S (not compounded).
 */
export class PackageRule implements PricingRule {
  apply(ctx: PricingContext, subtotal: Money): LineItem[] {
    const rates: Record<PackageType, number> = {
      [PackageType.WOOD]: 500,      // +5% = 500 basis points
      [PackageType.PLASTIC]: 1000,  // +10% = 1000 basis points
      [PackageType.CARDBOARD]: -100, // -1% = -100 basis points
    };

    const rate = rates[ctx.pkg];
    if (rate === 0) {
      return [];
    }

    const amount = subtotal.percentOf(rate);
    const labels: Record<PackageType, string> = {
      [PackageType.WOOD]: 'Wood packaging',
      [PackageType.PLASTIC]: 'Plastic packaging',
      [PackageType.CARDBOARD]: 'Cardboard packaging',
    };

    return [{ code: 'PACKAGE', label: labels[ctx.pkg], amount }];
  }
}

/**
 * Destination surcharge: percentage of S (not compounded).
 * USA/US/United States +18%, Bolivia +13%, India +19%, anything else +15%.
 * Case-insensitive, trimmed, aliases in a single map.
 */
export class DestinationRule implements PricingRule {
  private static readonly DESTINATION_RATES = new Map<string, number>([
    ['usa', 1800],
    ['us', 1800],
    ['united states', 1800],
    ['bolivia', 1300],
    ['india', 1900],
  ]);

  private static readonly DEFAULT_RATE = 1500; // +15% = 1500 basis points

  apply(ctx: PricingContext, subtotal: Money): LineItem[] {
    const normalized = ctx.destination.trim().toLowerCase();
    const rate = DestinationRule.DESTINATION_RATES.get(normalized) ?? DestinationRule.DEFAULT_RATE;

    const amount = subtotal.percentOf(rate);
    return [{ code: 'DESTINATION', label: `Destination: ${ctx.destination}`, amount }];
  }
}

/**
 * Shipping surcharge: SEA +400.00; LAND +10.00 x qty; AIR +30.00 x qty.
 */
export class ShippingRule implements PricingRule {
  apply(ctx: PricingContext, _subtotal: Money): LineItem[] {
    let amount: Money;
    let label: string;

    switch (ctx.mode) {
      case ShippingMode.Sea:
        amount = Money.fromDecimal(400);
        label = 'Sea shipping';
        break;
      case ShippingMode.Land:
        amount = Money.fromDecimal(10).times(ctx.quantity);
        label = 'Land shipping';
        break;
      case ShippingMode.Air:
        amount = Money.fromDecimal(30).times(ctx.quantity);
        label = 'Air shipping';
        break;
      default:
        return [];
    }

    return [{ code: 'SHIPPING', label, amount }];
  }
}

/**
 * Air bulk discount: -15% of the AIR line when qty > 1000.
 * This applies to the shipping line for Air mode.
 */
export class AirBulkDiscountRule implements PricingRule {
  apply(ctx: PricingContext, _subtotal: Money): LineItem[] {
    if (ctx.mode !== ShippingMode.Air || ctx.quantity <= 1000) {
      return [];
    }

    const airShippingAmount = Money.fromDecimal(30).times(ctx.quantity);
    const discount = airShippingAmount.percentOf(-1500); // -15% = -1500 basis points
    return [{ code: 'AIR_BULK_DISCOUNT', label: 'Air bulk discount', amount: discount }];
  }
}