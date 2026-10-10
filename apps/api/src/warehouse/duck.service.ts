import { Injectable } from '@nestjs/common';

@Injectable()
export class DuckService {
  add(dto: any): any {
    throw new Error('not implemented');
  }
}