import { Transform } from 'class-transformer';
import { IsString, IsNumber, Min, IsEnum, MinLength } from 'class-validator';
import { Color, Size } from '../../common/enums.js';
import { ShippingMode } from '../../domain/types.js';

const COLOR_MAP: Record<string, Color> = {
  red: Color.Red,
  green: Color.Green,
  yellow: Color.Yellow,
  black: Color.Black,
};

const SIZE_MAP: Record<string, Size> = {
  xlarge: Size.XLarge,
  large: Size.Large,
  medium: Size.Medium,
  small: Size.Small,
  xsmall: Size.XSmall,
};

const SHIPPING_MODE_MAP: Record<string, ShippingMode> = {
  land: ShippingMode.Land,
  air: ShippingMode.Air,
  sea: ShippingMode.Sea,
};

/**
 * Normalises a string to the matching enum value (case-insensitive).
 * Returns the original value if no match, letting @IsEnum produce a validation error.
 */
function normaliseEnum<T extends string>(map: Record<string, T>): (value: string) => T {
  return (value: string): T => {
    const mapped = map[value.toLowerCase()];
    return mapped ?? (value as T);
  };
}

/** DTO for POST /api/store/orders. All enums are case-insensitive and normalised via @Transform. */
export class CreateOrderDto {
  @Transform(({ value }) => normaliseEnum(COLOR_MAP)(String(value)))
  @IsEnum(Color)
  color: Color;

  @Transform(({ value }) => normaliseEnum(SIZE_MAP)(String(value)))
  @IsEnum(Size)
  size: Size;

  @Transform(({ value }) => Number(value))
  @IsNumber({ maxDecimalPlaces: 0 })
  @Min(1)
  quantity: number;

  @Transform(({ value }) => String(value ?? '').trim())
  @MinLength(1)
  @IsString()
  destination: string;

  @Transform(({ value }) => normaliseEnum(SHIPPING_MODE_MAP)(String(value)))
  @IsEnum(ShippingMode)
  shippingMode: ShippingMode;
}