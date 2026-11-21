import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {Redis} from 'ioredis';

@Injectable()
export class RateLimiterService {

  constructor(@Inject('REDIS') private redis: Redis) {}

  async hit(key: string, limit: number, windowMs: number) {

    const now = Date.now();

    const res = await this.redis
      .multi()
      .zremrangebyscore(key, 0, now - windowMs)       
      .zadd(key, now, `${now}-${randomUUID()}`)       
      .zcard(key)                                    
      .pexpire(key, windowMs)
      .exec();

    const count = res![2][1] as number;

    return { allowed: count <= limit, remaining: Math.max(0, limit - count), retryAfterMs: windowMs };
  }
}