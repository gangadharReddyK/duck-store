import { describe, expect, it } from 'vitest';
import { Size } from '../common/enums.js';
import { PackageType, Protection, ShippingMode } from './types.js';
import { packageFor, protectionFor } from './packaging.js';

describe('packaging', () => {
  it.each([
    [Size.XLarge, ShippingMode.Air, PackageType.WOOD, [Protection.POLYSTYRENE_BALLS]],
    [Size.XLarge, ShippingMode.Land, PackageType.WOOD, [Protection.POLYSTYRENE_BALLS]],
    [
      Size.XLarge,
      ShippingMode.Sea,
      PackageType.WOOD,
      [Protection.MOISTURE_ABSORBING_BEADS, Protection.BUBBLE_WRAP_BAGS],
    ],
    [Size.Large, ShippingMode.Air, PackageType.WOOD, [Protection.POLYSTYRENE_BALLS]],
    [Size.Large, ShippingMode.Land, PackageType.WOOD, [Protection.POLYSTYRENE_BALLS]],
    [
      Size.Large,
      ShippingMode.Sea,
      PackageType.WOOD,
      [Protection.MOISTURE_ABSORBING_BEADS, Protection.BUBBLE_WRAP_BAGS],
    ],
    [
      Size.Medium,
      ShippingMode.Air,
      PackageType.CARDBOARD,
      [Protection.POLYSTYRENE_BALLS],
    ],
    [
      Size.Medium,
      ShippingMode.Land,
      PackageType.CARDBOARD,
      [Protection.POLYSTYRENE_BALLS],
    ],
    [
      Size.Medium,
      ShippingMode.Sea,
      PackageType.CARDBOARD,
      [Protection.MOISTURE_ABSORBING_BEADS, Protection.BUBBLE_WRAP_BAGS],
    ],
    [Size.Small, ShippingMode.Air, PackageType.PLASTIC, [Protection.BUBBLE_WRAP_BAGS]],
    [Size.Small, ShippingMode.Land, PackageType.PLASTIC, [Protection.POLYSTYRENE_BALLS]],
    [
      Size.Small,
      ShippingMode.Sea,
      PackageType.PLASTIC,
      [Protection.MOISTURE_ABSORBING_BEADS, Protection.BUBBLE_WRAP_BAGS],
    ],
    [Size.XSmall, ShippingMode.Air, PackageType.PLASTIC, [Protection.BUBBLE_WRAP_BAGS]],
    [Size.XSmall, ShippingMode.Land, PackageType.PLASTIC, [Protection.POLYSTYRENE_BALLS]],
    [
      Size.XSmall,
      ShippingMode.Sea,
      PackageType.PLASTIC,
      [Protection.MOISTURE_ABSORBING_BEADS, Protection.BUBBLE_WRAP_BAGS],
    ],
  ])(
    'returns the expected package and protection for %s size via %s',
    (size, mode, expectedPackage, expectedProtections) => {
      expect(packageFor(size)).toBe(expectedPackage);
      expect(protectionFor(mode, packageFor(size))).toEqual(expectedProtections);
    },
  );
});