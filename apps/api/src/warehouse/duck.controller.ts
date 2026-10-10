import { Body, Controller, Post } from '@nestjs/common';
import { DuckService } from './duck.service';
import { CreateDuckDto } from './dto/create-duck.dto';

@Controller('ducks')
export class DuckController {
  constructor(private readonly duckService: DuckService) {}

  @Post()
  async add(@Body() dto: CreateDuckDto) {
    return this.duckService.add(dto);
  }
}