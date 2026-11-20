import {
  Global,
  Injectable,
  Logger,
  Module,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class RedisConnection implements OnApplicationShutdown {
  private readonly logger = new Logger(RedisConnection.name);
  readonly client: Redis;

  constructor(cfg: ConfigService) {
    this.client = new Redis(
      cfg.get<string>('REDIS_URL') ?? 'redis://localhost:6379',
      {
        // BullMQ محتاج القيمة دي
        maxRetriesPerRequest: null,
      },
    );

    // من غير الـ listener ده ioredis بيطبع "Unhandled error event"
    // ويعمل spam للوجز كل ما الاتصال يفشل.
    this.client.on('error', (err) => {
      this.logger.warn(`Redis: ${err.message}`);
    });
  }

  // من غير ده الـ process بيفضل شغال بعد app.close()
  // (زي seed.ts اللي كان بيعمل hang).
  async onApplicationShutdown() {
    if (this.client.status !== 'end') {
      await this.client.quit();
    }
  }
}

@Global()
@Module({
  providers: [
    RedisConnection,
    {
      provide: 'REDIS',
      inject: [RedisConnection],
      useFactory: (conn: RedisConnection) => conn.client,
    },
  ],
  exports: ['REDIS'],
})
export class RedisModule {}
