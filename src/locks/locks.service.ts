import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Redis } from 'ioredis';

@Injectable()
export class LocksService {
  constructor(@Inject('REDIS') private redis: Redis) {}
// key => lock name  ,  ttMs => expire date
  async acquire(key: string, ttlMs: number): Promise<string | null> {
    const token = randomUUID();
    //PX => means in Milliseconds
    //NX => يعني لو Request تاني حجز نفس الـ Lock، Redis مش هيسمح للـ Request الجديد إنه يحجزه.
    const ok = await this.redis.set(key, token, 'PX', ttlMs, 'NX');
    return ok === 'OK' ? token : null;
  }

  // دي بتفك اللوك بعد ما بنعمله 
  async release(key: string, token: string) {
    const lua = `
      if redis.call('get', KEYS[1]) == ARGV[1] then
        return redis.call('del', KEYS[1])
      else
        return 0
      end`;
    await this.redis.eval(lua, 1, key, token);
  }
  
}
