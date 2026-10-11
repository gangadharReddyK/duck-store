import { Controller, Post, Body, Res } from '@nestjs/common';
import { OrderService } from './order.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { OrderQuoteResult } from './order.service.js';
import type { Response } from 'express';

@Controller('store')
export class StoreController {
  constructor(private readonly orderService: OrderService) {}

  @Post('orders')
  async createOrder(@Body() dto: CreateOrderDto, @Res({ passthrough: true }) res: Response): Promise<OrderQuoteResult> {
    const result = await this.orderService.quote(
      dto.color,
      dto.size,
      dto.quantity,
      dto.destination,
      dto.shippingMode,
    );
    res.status(200);
    return result;
  }
}