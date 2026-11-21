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
    
        maxRetriesPerRequest: null,
      },
    );


    this.client.on('error', (err) => {
      this.logger.warn(`Redis: ${err.message}`);
    });
  }


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
 