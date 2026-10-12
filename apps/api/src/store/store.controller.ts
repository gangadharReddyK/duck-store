import { Controller, Post, Body, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { OrderService } from './order.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import type { Response } from 'express';

@ApiTags('store')
@Controller('store')
export class StoreController {
  constructor(private readonly orderService: OrderService) {}

  @Post('orders')
  @ApiOperation({ summary: 'Create a new order and get a quote' })
  @ApiBody({ type: CreateOrderDto, description: 'Order creation data' })
  @ApiResponse({ status: 200, description: 'Order quote returned successfully', schema: { type: 'object', properties: { package: { type: 'string' }, protection: { type: 'array', items: { type: 'string' } }, unitPrice: { type: 'number' }, lineItems: { type: 'array', items: { type: 'object', properties: { code: { type: 'string' }, label: { type: 'string' }, amount: { type: 'number' } } } }, total: { type: 'number' }, currency: { type: 'string', example: 'USD' } } } })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async createOrder(@Body() dto: CreateOrderDto, @Res({ passthrough: true }) res: Response) {
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