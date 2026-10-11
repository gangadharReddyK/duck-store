import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module.js';
import { HealthController } from './health/health.controller.js';
import { DuckController } from './warehouse/duck.controller.js';
import { AppController } from './app.controller.js';
import { DuckService } from './warehouse/duck.service.js';
import { DuckRepository } from './warehouse/duck.repository.js';
import { StoreController } from './store/store.controller.js';
import { OrderService } from './store/order.service.js';

@Module({
  imports: [
    DatabaseModule,
  ],
  controllers: [HealthController, DuckController, StoreController, AppController],
  providers: [DuckService, DuckRepository, OrderService],
})
export class AppModule {}
