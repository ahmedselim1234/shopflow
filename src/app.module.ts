import { Module } from '@nestjs/common';
// Configuration
import { ConfigModule, ConfigService } from '@nestjs/config';
import { buildTypeOrmOptions } from './config/db.js';
// Database
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity.js';
import { Product } from './products/product.entity.js';
import { Order, OrderItem } from './orders/order.entity.js';
import { IdempotencyKey } from './idempotency/idempotency-key.entity.js';
// Redis & Cache
import { RedisModule } from './redis/redis.module.js';
import { CacheModule } from './cache/cache.module.js';
// Background Jobs & Queue Dashboard
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
// Application Modules
import { OrdersModule } from './orders/orders.module.js';
import { ProductsModule } from './products/products.module.js';
import { AuthModule } from './auth/auth.module.js';
// Scheduling & Distributed Locks
import { ScheduleModule } from '@nestjs/schedule';
import { LocksModule } from './locks/locks.module.js';
// Reports & Rate Limiting
import { ReportsModule } from './reports/reports.module.js';
import { RateLimitModule } from './rate-limit/rate-limit.module.js';
import { ReportDaily } from './reports/report-daily.entity.js';
import { ImportsModule } from './imports/imports.module.js';
// Health & Graceful Shutdown
import { HealthModule } from './health/health.module.js';
import { MonitoringModule } from './monitoring/monitoring.module.js';
import { WebsocketGateway } from './websocket/websocket.gateway.js';
 
@Module({
  imports: [
    // 1. Scheduling & Distributed Locks
    ScheduleModule.forRoot(),
    LocksModule,
    // 2. Reports
    ReportsModule,
    // 3. Background Jobs (BullMQ)
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: Number(process.env.REDIS_PORT ?? 6379),
      },
    }),
    // 4. Bull Board - Queue Dashboard
    BullBoardModule.forRoot({
      route: '/admin/queues',
      adapter: ExpressAdapter,
    }),

    BullBoardModule.forFeature(
      { name: 'emails', adapter: BullMQAdapter },
      { name: 'dlq-emails', adapter: BullMQAdapter },
      { name: 'reports', adapter: BullMQAdapter },
      {
        name: 'imports',
        adapter: BullMQAdapter,
      },
    ),
    // 5. Application Modules
    OrdersModule,
    ProductsModule,
    AuthModule,
    // 5b. Health & Graceful Shutdown (/health/live, /health/ready)
    HealthModule,
    // 6. Cache
    CacheModule,
    // 7. Rate Limiting
    RateLimitModule,
    // 8. Global Configuration
    ConfigModule.forRoot({ isGlobal: true }),
    // 9. Database Connection
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: buildTypeOrmOptions,
    }),
    // Database Entities
    TypeOrmModule.forFeature([
      User,
      Product,
      Order,
      OrderItem,
      IdempotencyKey,
      ReportDaily,
    ]),
    // 10. Redis Connection
    RedisModule,
    // csv
    ImportsModule,
   
  ],
 
})
export class AppModule {}
