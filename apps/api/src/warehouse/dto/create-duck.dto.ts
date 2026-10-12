import { IsNumber, IsPositive, IsInt, Min, IsEnum } from 'class-validator';
import { Color, Size } from '../../common/enums.js';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDuckDto {
  @ApiProperty({
    description: 'The color of the duck',
    example: 'Red',
    enum: Color,
  })
  @IsEnum(Color)
  color: Color;

  @ApiProperty({
    description: 'The size of the duck',
    example: 'Medium',
    enum: Size,
  })
  @IsEnum(Size)
  size: Size;

  @ApiProperty({
    description: 'The price of the duck in USD',
    example: 12.99,
    minimum: 0.01,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price: number;

  @ApiProperty({
    description: 'The quantity of ducks',
    example: 5,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  quantity: number;
}