import { Body, Controller, Post, Res } from '@nestjs/common';
import { DuckService } from './duck.service.js';
import { CreateDuckDto } from './dto/create-duck.dto.js';
import type { Response } from 'express';

@Controller('ducks')
export class DuckController {
  constructor(private readonly duckService: DuckService) {}

  @Post()
  async add(@Body() dto: CreateDuckDto, @Res({ passthrough: true }) res: Response) {
    const { duck, merged } = await this.duckService.add(dto);
    res.status(merged ? 200 : 201);
    return duck;
  }
}