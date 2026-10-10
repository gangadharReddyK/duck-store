import { IsNumber, IsPositive, IsString, IsInt, Min, IsEnum } from 'class-validator';
import { Color, Size } from '@/common/enums';

export class CreateDuckDto {
  @IsEnum(Color)
  color: Color;

  @IsEnum(Size)
  size: Size;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price: number;

  @IsInt()
  @Min(1)
  quantity: number;
}