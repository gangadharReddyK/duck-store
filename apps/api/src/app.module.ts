import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module.js';
import { HealthController } from './health/health.controller.js';
import { DuckController } from './warehouse/duck.controller.js';
import { DuckService } from './warehouse/duck.service.js';
import { DuckRepository } from './warehouse/duck.repository.js';

@Module({
  imports: [
    DatabaseModule,
  ],
  controllers: [HealthController, DuckController],
  providers: [DuckService, DuckRepository],
})
export class AppModule {}
