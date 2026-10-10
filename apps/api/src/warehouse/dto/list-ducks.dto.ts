import { IsEnum, IsOptional } from 'class-validator';

export const SORT_FIELDS = ['quantity'] as const;

export class ListDucksDto {
  @IsOptional()
  @IsEnum(SORT_FIELDS, { message: 'sort must be "quantity"' })
  sort?: (typeof SORT_FIELDS)[number];

  @IsOptional()
  @IsEnum(['asc', 'desc'], { message: 'order must be "asc" or "desc"' })
  order?: 'asc' | 'desc';
}
