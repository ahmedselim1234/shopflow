import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from './redis/redis.module.js';
import { User } from './users/user.entity.js';
import { Product } from './products/product.entity.js';
import { Order, OrderItem } from './orders/order.entity.js';
import { IdempotencyKey } from './idempotency/idempotency-key.entity.js';
import { buildTypeOrmOptions } from './config/db.js';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { OrdersModule } from './orders/orders.module.js';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: Number(process.env.REDIS_PORT ?? 6379),
      },
    }),
    BullBoardModule.forRoot({
      route: '/admin/queues',
      adapter: ExpressAdapter,
    }),
    BullBoardModule.forFeature(
      { name: 'emails', adapter: BullMQAdapter },
      { name: 'dlq-emails', adapter: BullMQAdapter },
    ),
    OrdersModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: buildTypeOrmOptions,
    }),
    TypeOrmModule.forFeature([User, Product, Order, OrderItem, IdempotencyKey]),
    RedisModule,
  ],
})
export class AppModule {}
