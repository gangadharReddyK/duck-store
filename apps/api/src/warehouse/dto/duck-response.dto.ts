import { Color, Size } from '@/common/enums';

export type DuckResponse = {
  id: number;
  color: Color;
  size: Size;
  price: number;
  quantity: number;
  version: number;
};