import { Size } from '../common/enums.js';
import { PackageType, Protection, ShippingMode } from './types.js';

const PACKAGE_BY_SIZE: Record<Size, PackageType> = {
  [Size.XLarge]: PackageType.WOOD,
  [Size.Large]: PackageType.WOOD,
  [Size.Medium]: PackageType.CARDBOARD,
  [Size.Small]: PackageType.PLASTIC,
  [Size.XSmall]: PackageType.PLASTIC,
};

const PROTECTION_BY_MODE_AND_PACKAGE: Record<
  ShippingMode,
  Record<PackageType, Protection[]>
> = {
  [ShippingMode.Air]: {
    [PackageType.WOOD]: [Protection.POLYSTYRENE_BALLS],
    [PackageType.CARDBOARD]: [Protection.POLYSTYRENE_BALLS],
    [PackageType.PLASTIC]: [Protection.BUBBLE_WRAP_BAGS],
  },
  [ShippingMode.Land]: {
    [PackageType.WOOD]: [Protection.POLYSTYRENE_BALLS],
    [PackageType.CARDBOARD]: [Protection.POLYSTYRENE_BALLS],
    [PackageType.PLASTIC]: [Protection.POLYSTYRENE_BALLS],
  },
  [ShippingMode.Sea]: {
    [PackageType.WOOD]: [Protection.MOISTURE_ABSORBING_BEADS, Protection.BUBBLE_WRAP_BAGS],
    [PackageType.CARDBOARD]: [Protection.MOISTURE_ABSORBING_BEADS, Protection.BUBBLE_WRAP_BAGS],
    [PackageType.PLASTIC]: [Protection.MOISTURE_ABSORBING_BEADS, Protection.BUBBLE_WRAP_BAGS],
  },
};

export function packageFor(size: Size): PackageType {
  return PACKAGE_BY_SIZE[size];
}

export function protectionFor(
  mode: ShippingMode,
  pkg: PackageType,
): Protection[] {
  return PROTECTION_BY_MODE_AND_PACKAGE[mode][pkg];
}
