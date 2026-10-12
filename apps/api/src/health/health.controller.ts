import { Controller, Get, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Pool } from 'mysql2/promise';

@ApiTags('health')
@Controller()
export class HealthController {
  constructor(@Inject('DB_POOL') private readonly pool: Pool) {}

  @Get('health')
  @ApiOperation({ summary: 'Check API health status' })
  @ApiResponse({ status: 200, description: 'API is healthy', schema: { type: 'object', properties: { status: { type: 'string', example: 'ok' } } } })
  async getHealth() {
    const [rows] = await this.pool.query('SELECT 1 AS value');
    return { status: 'ok' };
  }
}
