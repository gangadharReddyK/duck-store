import { describe, expect, it } from 'vitest';
import { Money } from '../money.js';
import { PackageType, ShippingMode, Size } from '../types.js';
import { PricingPipeline } from './pricing-pipeline.js';
import { packageFor } from '../packaging.js';

describe('PricingPipeline', () => {
  const pipeline = new PricingPipeline();

  const testCases = [
    // SPEC 5.7 checked totals
    {
      name: '10 Medium @10.00 Sea USA = 517.00',
      size: Size.Medium,
      unitPrice: Money.fromDecimal(10.00),
      quantity: 10,
      mode: ShippingMode.Sea,
      destination: 'USA',
      expectedTotal: Money.fromDecimal(517.00),
    },
    {
      name: '200 Large @5.00 Air India = 6992.00',
      size: Size.Large,
      unitPrice: Money.fromDecimal(5.00),
      quantity: 200,
      mode: ShippingMode.Air,
      destination: 'India',
      expectedTotal: Money.fromDecimal(6992.00),
    },
    {
      name: '100 Small @2.00 Land Bolivia = 1246.00',
      size: Size.Small,
      unitPrice: Money.fromDecimal(2.00),
      quantity: 100,
      mode: ShippingMode.Land,
      destination: 'Bolivia',
      expectedTotal: Money.fromDecimal(1246.00),
    },
    {
      name: '101 Small @2.00 Land Bolivia = 1208.77',
      size: Size.Small,
      unitPrice: Money.fromDecimal(2.00),
      quantity: 101,
      mode: ShippingMode.Land,
      destination: 'Bolivia',
      expectedTotal: Money.fromDecimal(1208.77),
    },
    {
      name: '1001 Medium @1.00 Air Other = 26438.41',
      size: Size.Medium,
      unitPrice: Money.fromDecimal(1.00),
      quantity: 1001,
      mode: ShippingMode.Air,
      destination: 'Other',
      expectedTotal: Money.fromDecimal(26438.41),
    },
    // Boundary tests for 100/101 units (volume discount threshold)
    {
      name: '100 Medium @10.00 Sea USA (boundary - no volume discount)',
      size: Size.Medium,
      unitPrice: Money.fromDecimal(10.00),
      quantity: 100,
      mode: ShippingMode.Sea,
      destination: 'USA',
      expectedTotal: Money.fromDecimal(1570.00),
    },
    {
      name: '101 Medium @10.00 Sea USA (boundary - with volume discount)',
      size: Size.Medium,
      unitPrice: Money.fromDecimal(10.00),
      quantity: 101,
      mode: ShippingMode.Sea,
      destination: 'USA',
      expectedTotal: Money.fromDecimal(1345.36),
    },
    // Boundary tests for 1000/1001 units (air bulk discount threshold)
    {
      name: '1000 Medium @1.00 Air Other (boundary - no air bulk discount)',
      size: Size.Medium,
      unitPrice: Money.fromDecimal(1.00),
      quantity: 1000,
      mode: ShippingMode.Air,
      destination: 'Other',
      expectedTotal: Money.fromDecimal(30912.00),
    },
    {
      name: '1001 Medium @1.00 Air Other (boundary - with air bulk discount)',
      size: Size.Medium,
      unitPrice: Money.fromDecimal(1.00),
      quantity: 1001,
      mode: ShippingMode.Air,
      destination: 'Other',
      expectedTotal: Money.fromDecimal(26438.41),
    },
  ];

  it.each(testCases)('$name', ({ size, unitPrice, quantity, mode, destination, expectedTotal }) => {
    const pkg = packageFor(size);
    const ctx = {
      unitPrice,
      quantity,
      pkg,
      destination,
      mode,
    };

    const result = pipeline.apply(ctx);

    // Verify total matches expected
    expect(result.total.cents).toBe(expectedTotal.cents);

    // Verify line items sum to total
    const sum = result.lineItems.reduce((acc, item) => acc.plus(item.amount), new Money(0));
    expect(sum.cents).toBe(result.total.cents);
  });
});