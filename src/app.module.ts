import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from './redis/redis.module.js';
import { User } from './users/user.entity.js';
import { Product } from './products/product.entity.js';
import { Order, OrderItem } from './orders/order.entity.js';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        url: cfg.getOrThrow('DATABASE_URL'),
        autoLoadEntities: true,   // أي Entity مسجلة بـ forFeature تتحمل لوحدها
        synchronize: true,        // للتطوير بس! هنقفله يوم 7 ونستخدم Migrations
        extra: { max: 20, idleTimeoutMillis: 30000 },
      }),
    }),
    TypeOrmModule.forFeature([User, Product, Order, OrderItem]),
    RedisModule,
  ],
})
export class AppModule {}