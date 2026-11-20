import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { RedisModule } from './redis/redis.module.js';
import { User } from './users/user.entity.js';
import { Product } from './products/product.entity.js';
import { Order, OrderItem } from './orders/order.entity.js';
import { IdempotencyKey } from './idempotency/idempotency-key.entity.js';
import { buildTypeOrmOptions } from './config/db.js';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: buildTypeOrmOptions,
    }),
    TypeOrmModule.forFeature([
      User,
      Product,
      Order,
      OrderItem,
      IdempotencyKey,
    ]),
    RedisModule,
  ],
})
export class AppModule {}
