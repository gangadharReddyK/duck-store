import { IsNumber, IsPositive, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDuckDto {
  @ApiProperty({
    description: 'The price of the duck in USD',
    example: 15.5,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price: number;

  @ApiProperty({
    description: 'The quantity of ducks',
    example: 10,
  })
  @IsInt()
  @Min(0)
  quantity: number;

  @ApiProperty({
    description: 'The version for optimistic locking',
    example: 1,
  })
  @IsInt()
  version: number;
}