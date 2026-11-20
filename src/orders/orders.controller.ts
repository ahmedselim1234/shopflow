import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { DevAuthGuard } from '../auth/dev-auth.guard.js';
import { CreateOrderDto } from './dtos/createOrder.dto.js';
import { OrdersService } from './orders.service.js';

@Controller('orders')
@UseGuards(DevAuthGuard)
export class OrdersController {

  constructor(private orders: OrdersService) {}

  @Post()
  create(@Req() req :any , @Body() dto: CreateOrderDto) {
    return this.orders.create(req.user.id, dto);
  }

}