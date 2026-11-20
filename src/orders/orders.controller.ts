import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DevAuthGuard } from '../auth/dev-auth.guard.js';
import { CreateOrderDto } from './dtos/createOrder.dto.js';
import { OrdersService } from './orders.service.js';
import { IdempotencyService } from '../idempotency/idempotency.service.js';

@Controller('orders')
@UseGuards(DevAuthGuard)
export class OrdersController {
  constructor(
    private orders: OrdersService,
    private idempotency: IdempotencyService,
  ) {}

  @Post()
  create(
    @Req() req: any,
    @Headers('idempotency-key') key: string,
    @Body() dto: CreateOrderDto,
  ) {
    if (!key)
      throw new BadRequestException('Idempotency-Key header is required');
    return this.idempotency.run(key, req.user.id, dto, () =>
      this.orders.create(req.user.id, dto),
    );
  }
}
