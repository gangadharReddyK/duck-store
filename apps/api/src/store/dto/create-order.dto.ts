import { Transform } from 'class-transformer';
import { IsString, IsNumber, Min, IsEnum, MinLength } from 'class-validator';
import { Color, Size } from '../../common/enums.js';
import { ShippingMode } from '../../domain/types.js';
import { ApiProperty } from '@nestjs/swagger';

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
  @ApiProperty({
    description: 'The color of the duck',
    example: 'red',
    enum: Color,
  })
  @Transform(({ value }) => normaliseEnum(COLOR_MAP)(String(value)))
  @IsEnum(Color)
  color: Color;

  @ApiProperty({
    description: 'The size of the duck',
    example: 'medium',
    enum: Size,
  })
  @Transform(({ value }) => normaliseEnum(SIZE_MAP)(String(value)))
  @IsEnum(Size)
  size: Size;

  @ApiProperty({
    description: 'The quantity of ducks',
    example: 5,
    minimum: 1,
  })
  @Transform(({ value }) => Number(value))
  @IsNumber({ maxDecimalPlaces: 0 })
  @Min(1)
  quantity: number;

  @ApiProperty({
    description: 'The destination for shipping',
    example: 'New York, NY',
    minLength: 1,
  })
  @Transform(({ value }) => String(value ?? '').trim())
  @MinLength(1)
  @IsString()
  destination: string;

  @ApiProperty({
    description: 'The shipping mode',
    example: 'land',
    enum: ShippingMode,
  })
  @Transform(({ value }) => normaliseEnum(SHIPPING_MODE_MAP)(String(value)))
  @IsEnum(ShippingMode)
  shippingMode: ShippingMode;
}