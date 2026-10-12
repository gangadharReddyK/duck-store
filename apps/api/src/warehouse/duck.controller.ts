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
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery, ApiParam } from '@nestjs/swagger';
import { DuckService } from './duck.service.js';
import { CreateDuckDto } from './dto/create-duck.dto.js';
import { UpdateDuckDto } from './dto/update-duck.dto.js';
import { ListDucksDto } from './dto/list-ducks.dto.js';
import type { Response } from 'express';

@ApiTags('ducks')
@Controller('ducks')
export class DuckController {
  constructor(private readonly duckService: DuckService) {}

  @Get()
  @ApiOperation({ summary: 'List all ducks with optional ordering' })
  @ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'], description: 'Sort order (asc or desc)' })
  @ApiResponse({ status: 200, description: 'List of ducks returned successfully' })
  async list(@Query() query: ListDucksDto) {
    const order = query.order ?? 'desc';
    return this.duckService.list(order);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new duck' })
  @ApiBody({ type: CreateDuckDto, description: 'Duck creation data' })
  @ApiResponse({ status: 201, description: 'Duck created successfully' })
  @ApiResponse({ status: 200, description: 'Duck merged with existing (when duplicate found)' })
  async add(@Body() dto: CreateDuckDto, @Res({ passthrough: true }) res: Response) {
    const { duck, merged } = await this.duckService.add(dto);
    res.status(merged ? 200 : 201);
    return duck;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a duck by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Duck ID to update' })
  @ApiBody({ type: UpdateDuckDto, description: 'Duck update data' })
  @ApiResponse({ status: 200, description: 'Duck updated successfully' })
  @ApiResponse({ status: 404, description: 'Duck not found' })
  async update(@Param('id') id: string, @Body() dto: UpdateDuckDto) {
    return this.duckService.update(Number(id), dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a duck by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Duck ID to delete' })
  @ApiResponse({ status: 204, description: 'Duck deleted successfully' })
  @ApiResponse({ status: 404, description: 'Duck not found' })
  async delete(@Param('id') id: string, @Res({ passthrough: true }) res: Response) {
    await this.duckService.delete(Number(id));
    res.status(204);
    return;
  }
}