import { Money } from '../money.js';
import { PackageType, ShippingMode } from '../types.js';

/**
 * Pricing context: the inputs to the pricing rules.
 */
export interface PricingContext {
  unitPrice: Money;
  quantity: number;
  pkg: PackageType;
  destination: string;
  mode: ShippingMode;
}

/**
 * A single line in the itemised price breakdown.
 */
export interface LineItem {
  code: string;
  label: string;
  amount: Money;
}