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
  @ApiResponse({
    status: 200,
    description: 'Possible sample Responses',
    schema: {
      type: 'object',
      properties: {
        package: { type: 'string' },
        protection: { type: 'array', items: { type: 'string' } },
        unitPrice: { type: 'number' },
        lineItems: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              code: { type: 'string' },
              label: { type: 'string' },
              amount: { type: 'number' }
            }
          }
        },
        total: { type: 'number' },
        currency: { type: 'string', example: 'USD' }
      }
    },
    examples: {
      'basic-sea-usa': {
        summary: 'Basic Sea shipment to USA',
        value: {
          package: 'CARDBOARD',
          protection: ['MOISTURE_ABSORBING_BEADS', 'BUBBLE_WRAP_BAGS'],
          unitPrice: 10.00,
          lineItems: [
            { code: 'BASE', label: 'Base price', amount: 100.00 },
            { code: 'PACKAGE', label: 'Cardboard packaging', amount: -1.00 },
            { code: 'DESTINATION', label: 'Destination: USA', amount: 18.00 },
            { code: 'SHIPPING', label: 'Sea shipping', amount: 400.00 }
          ],
          total: 517.00,
          currency: 'USD'
        }
      },
      'volume-discount-boundary': {
        summary: 'Volume discount threshold (101 units)',
        value: {
          package: 'CARDBOARD',
          protection: ['MOISTURE_ABSORBING_BEADS', 'BUBBLE_WRAP_BAGS'],
          unitPrice: 10.00,
          lineItems: [
            { code: 'BASE', label: 'Base price', amount: 1010.00 },
            { code: 'VOLUME_DISCOUNT', label: 'Volume discount', amount: -202.00 },
            { code: 'PACKAGE', label: 'Cardboard packaging', amount: -8.08 },
            { code: 'DESTINATION', label: 'Destination: USA', amount: 145.44 },
            { code: 'SHIPPING', label: 'Sea shipping', amount: 400.00 }
          ],
          total: 1345.36,
          currency: 'USD'
        }
      },
      'air-bulk-discount': {
        summary: 'Air bulk discount (1001 units)',
        value: {
          package: 'CARDBOARD',
          protection: ['POLYSTYRENE_BALLS'],
          unitPrice: 1.00,
          lineItems: [
            { code: 'BASE', label: 'Base price', amount: 1001.00 },
            { code: 'VOLUME_DISCOUNT', label: 'Volume discount', amount: -200.20 },
            { code: 'PACKAGE', label: 'Cardboard packaging', amount: -8.08 },
            { code: 'DESTINATION', label: 'Destination: Other', amount: 145.44 },
            { code: 'SHIPPING', label: 'Air shipping', amount: 30030.00 },
            { code: 'AIR_BULK_DISCOUNT', label: 'Air bulk discount', amount: -4504.50 }
          ],
          total: 26438.41,
          currency: 'USD'
        }
      },
      'wood-package-air': {
        summary: 'Wood package with Air shipment',
        value: {
          package: 'WOOD',
          protection: ['POLYSTYRENE_BALLS'],
          unitPrice: 5.00,
          lineItems: [
            { code: 'PACKAGE', label: 'Wood packaging', amount: 0.25 },
            { code: 'DESTINATION', label: 'Destination: USA', amount: 0.90 },
            { code: 'SHIPPING', label: 'Air shipping', amount: 30.00 }
          ],
          total: 36.15,
          currency: 'USD'
        }
      }
    }
  })
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