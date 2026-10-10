import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { DuckService } from './duck.service.js';
import { CreateDuckDto } from './dto/create-duck.dto.js';
import { UpdateDuckDto } from './dto/update-duck.dto.js';
import { ListDucksDto } from './dto/list-ducks.dto.js';
import type { Response } from 'express';

@Controller('ducks')
export class DuckController {
  constructor(private readonly duckService: DuckService) {}

  @Get()
  async list(@Query() query: ListDucksDto) {
    const order = query.order ?? 'desc';
    return this.duckService.list(order);
  }

  @Post()
  async add(@Body() dto: CreateDuckDto, @Res({ passthrough: true }) res: Response) {
    const { duck, merged } = await this.duckService.add(dto);
    res.status(merged ? 200 : 201);
    return duck;
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateDuckDto) {
    return this.duckService.update(Number(id), dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Res({ passthrough: true }) res: Response) {
    await this.duckService.delete(Number(id));
    res.status(204);
    return;
  }
}