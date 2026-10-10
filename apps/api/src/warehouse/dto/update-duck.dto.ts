import { IsNumber, IsPositive, IsInt, Min } from 'class-validator';

export class UpdateDuckDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price: number;

  @IsInt()
  @Min(0)
  quantity: number;

  @IsInt()
  version: number;
}