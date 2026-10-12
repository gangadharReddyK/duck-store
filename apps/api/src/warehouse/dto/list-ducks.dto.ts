import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export const SORT_FIELDS = ['quantity'] as const;

export class ListDucksDto {
  @ApiProperty({
    description: 'Field to sort by',
    example: 'quantity',
    required: false,
  })
  @IsOptional()
  @IsEnum(SORT_FIELDS, { message: 'sort must be "quantity"' })
  sort?: (typeof SORT_FIELDS)[number];

  @ApiProperty({
    description: 'Sort order',
    example: 'desc',
    required: false,
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'], { message: 'order must be "asc" or "desc"' })
  order?: 'asc' | 'desc';
}