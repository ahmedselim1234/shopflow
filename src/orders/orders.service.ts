import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bullmq';
import { In, Repository } from 'typeorm';
import { Order } from './order.entity.js';
import { Product } from '../products/product.entity.js';
import { CreateOrderDto } from './dtos/createOrder.dto.js';
import { EMAIL_JOB_OPTIONS } from '../mail/email-job-options.js';

@Injectable()
export class OrdersService {
  constructor(
    @InjectQueue('emails') private emails: Queue,
    @InjectRepository(Order) private orders: Repository<Order>,
    @InjectRepository(Product) private products: Repository<Product>,
  ) {}

  // create (order) and send (job)
  async create(userId: string, dto: CreateOrderDto) {
    // create (order)
    const order = await this.saveOrder(userId, dto);
    //send (job) to Queue and this name of job order-confirmation
    await this.emails.add('order-confirmation', {
      orderId: order.id,
      to: dto.customerEmail,
    },EMAIL_JOB_OPTIONS);

    return order;
  }

  private async saveOrder(userId: string, dto: CreateOrderDto) {
    const found = await this.products.findBy({
      id: In(dto.items.map((i) => i.productId)),
    });

    const price = new Map(found.map((p) => [p.id, p.priceCents]));

    const items = dto.items.map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
      unitPriceCents: price.get(i.productId) ?? 0,
    }));

    const total = items.reduce((s, i) => s + i.unitPriceCents * i.quantity, 0);
    return this.orders.save(
      this.orders.create({ userId, totalCents: total, items: items as any }),
    );
  }
}
