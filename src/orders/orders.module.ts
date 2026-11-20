import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailsProcessor } from '../mail/emails.processor.js';
import { MailService } from '../mail/mail.service.js';
import { Order, OrderItem } from './order.entity.js';
import { Product } from '../products/product.entity.js';
import { OrdersController } from './orders.controller.js';
import { OrdersService } from './orders.service.js';
import { IdempotencyService } from '../idempotency/idempotency.service.js';
import { DlqController } from '../mail/dlq.controller.js';
import { IdempotencyKey } from '../idempotency/idempotency-key.entity.js';


@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Product,IdempotencyKey]),
    BullModule.registerQueue({ name: 'emails' }, { name: 'dlq-emails' }),
  ],
  controllers: [OrdersController,DlqController],
  providers: [OrdersService, EmailsProcessor, MailService,IdempotencyService],
})
export class OrdersModule {}

