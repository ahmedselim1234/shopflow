import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { CreateOrderDto } from './dtos/createOrder.dto.js';

@Injectable()
export class OrdersService {
  constructor(@InjectQueue('emails') private emails: Queue) {}
  async create(userId: string, dto: CreateOrderDto) {
    const order = await this.saveOrder(userId, dto);
    await this.emails.add('order-confirmation', {
      orderId: order.id,
      to: dto.customerEmail,
    });
    return order;
  }
}
