import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('app')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Get hello world message' })
  @ApiResponse({ status: 200, description: 'Returns hello world message', schema: { type: 'string', example: 'Hello World!' } })
  getHello(): string {
    return 'Hello World!';
  }
}