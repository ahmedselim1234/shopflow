import {
  ConflictException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash } from 'node:crypto';
import { Repository } from 'typeorm';
import { IdempotencyKey } from './idempotency-key.entity.js';


@Injectable()
export class IdempotencyService {
  constructor(
    @InjectRepository(IdempotencyKey) private repo: Repository<IdempotencyKey>,
  ) {}


  async run<T>(
    key: string,
    userId: string,
    payload: unknown,
    handler: () => Promise<T>,
  ): Promise<T> {
    const hash = createHash('sha256')
      .update(JSON.stringify(payload))
      .digest('hex');

    try {
      await this.repo.insert({
        key,
        userId,
        requestHash: hash,
        status: 'processing',
      });
    } catch (e: any) {
      if (e.code !== '23505') throw e; 
      const existing = await this.repo.findOneByOrFail({ key, userId });
      if (existing.requestHash !== hash)
        throw new UnprocessableEntityException(
          'Idempotency-Key reused with a different payload',
        );
      if (existing.status === 'processing')
        throw new ConflictException('Request is still being processed');
      return existing.response as T; 
    }

    try {
      const result = await handler();
      await this.repo.update(
        { key, userId },
        { status: 'completed', response: result as any },
      );
      return result;
    } catch (err) {
      await this.repo.delete({ key, userId }); 
      throw err;
    }
    
  }
}
