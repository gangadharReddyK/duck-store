import { Controller, Get, Inject } from '@nestjs/common';
import type { Pool } from 'mysql2/promise';

@Controller()
export class HealthController {
  constructor(@Inject('DB_POOL') private readonly pool: Pool) {}

  @Get('health')
  async getHealth() {
    const [rows] = await this.pool.query('SELECT 1 AS value');
    return { status: 'ok' };
  }
}
