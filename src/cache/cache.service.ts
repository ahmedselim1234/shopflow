import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { LocksService } from '../locks/locks.service.js';
import { sleep } from '../common/sleep.js';

@Injectable()
export class CacheService {

  constructor(
    @Inject('REDIS') private redis: Redis,
    private locks: LocksService,
  ) {}

  async getOrSet<T>(
    key: string,
    //مدة الاحتفاظ بالبيانات بالثواني
    ttlSec: number,
    //الفانكشن الي هتجيب الداتا من الداتا بيز
    loader: () => Promise<T>,
    //عدد مرات إعادة المحاولة
    attempts = 20,
  ): Promise<T> {
    // بنسال ريديس هل البيانات موجوده 
    const hit = await this.redis.get(key);

    if (hit !== null) return JSON.parse(hit);

    const lockKey = `lock:${key}`;

    const token = await this.locks.acquire(lockKey, 5000);

    if (!token) {
      if (attempts <= 0) return loader(); // حل أخير
      await sleep(100);
      return this.getOrSet(key, ttlSec, loader, attempts - 1); 
    //   Cache;
    }

    try {
         // Double-check => علشان لو ريكويست سبقه وعمل هو لوك
      const again = await this.redis.get(key);
      
      if (again !== null) return JSON.parse(again);

      const value = await loader();

      const jitter = Math.floor(Math.random() * ttlSec * 0.1); // عشان المفاتيح ما تنتهيش كلها مع بعض
      
      const ttl = value == null ? 30 : ttlSec + jitter; // Negative Caching
      // التخزين في ريديس
      await this.redis.set(key, JSON.stringify(value ?? null), 'EX', ttl);
      
      return value;
    } finally {
      await this.locks.release(lockKey, token);
    }
  }

  del(key: string) {
    return this.redis.del(key);
  }

}
