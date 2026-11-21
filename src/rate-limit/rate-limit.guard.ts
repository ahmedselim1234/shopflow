// import {
//   CanActivate,
//   ExecutionContext,
//   HttpException,
//   HttpStatus,
//   Injectable,
//   Logger,
//   SetMetadata,
// } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { RateLimiterService } from './rate-limiter.service.js';

// export const RateLimit = (
//   limit: number,
//   windowSec: number,
//   by: 'ip' | 'ip+body.email' = 'ip',
// ) => SetMetadata('rate-limit', { limit, windowSec, by });

// const DEFAULT_LIMIT = { limit: 100, windowSec: 60, by: 'ip' }; // الحد العام ألي Endpoint

// @Injectable()
// export class RateLimitGuard implements CanActivate {
//   private readonly log = new Logger(RateLimitGuard.name);
//   constructor(
//     private reflector: Reflector,
//     private limiter: RateLimiterService,
//   ) {}
//   async canActivate(ctx: ExecutionContext) {
//     if (ctx.getType() !== 'http') return true;
//     const cfg =
//       this.reflector.get<any>('rate-limit', ctx.getHandler()) ?? DEFAULT_LIMIT;
//     const req = ctx.switchToHttp().getRequest();
//     const res = ctx.switchToHttp().getResponse();
//     const id = cfg.by === 'ip' ? req.ip : `${req.ip}:${req.body?.email ?? ''}`;

//     const key = `rl:${ctx.getClass().name}:${ctx.getHandler().name}:${id}`;
//     let r;
//     try {
//       r = await this.limiter.hit(key, cfg.limit, cfg.windowSec * 1000);
//     } catch (e) {
//       this.log.error('Redis down, rate limiter is failing open');
//       return true;
//     }
//     res.setHeader('X-RateLimit-Remaining', r.remaining);
//     if (!r.allowed) {
//       res.setHeader('Retry-After', cfg.windowSec);
//       throw new HttpException(
//         'Too many requests',
//         HttpStatus.TOO_MANY_REQUESTS,
//       );
//     }
//     return true;
//   }
// }

import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  SetMetadata,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';
import { createHash } from 'node:crypto';
import { RateLimiterService } from './rate-limiter.service.js';

type RateLimitBy = 'ip' | 'ip+body.email';

type RateLimitConfig = {
  limit: number;
  windowSec: number;
  by: RateLimitBy;
};

const RATE_LIMIT_KEY = 'rate-limit';

export const RateLimit = (
  limit: number,
  windowSec: number,
  by: RateLimitBy = 'ip',
) =>
  SetMetadata(RATE_LIMIT_KEY, {
    limit,
    windowSec,
    by,
  } satisfies RateLimitConfig);

const DEFAULT_LIMIT: RateLimitConfig = {
  limit: 100,
  windowSec: 60,
  by: 'ip',
};

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly log = new Logger(RateLimitGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly limiter: RateLimiterService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    if (ctx.getType() !== 'http') return true;

    const cfg =
      this.reflector.getAllAndOverride<RateLimitConfig>(RATE_LIMIT_KEY, [
        ctx.getHandler(),
        ctx.getClass(),
      ]) ?? DEFAULT_LIMIT;

    const req = ctx.switchToHttp().getRequest();
    const res = ctx.switchToHttp().getResponse();

    const ip = req.ip ?? 'unknown';

    const email =
      typeof req.body?.email === 'string'
        ? req.body.email.trim().toLowerCase()
        : '';

    const identity =
      cfg.by === 'ip'
        ? ip
        : `${ip}:${createHash('sha256').update(email).digest('hex')}`;

    const key = `rl:${ctx.getClass().name}:${ctx.getHandler().name}:${identity}`;

    let result;

    try {
      result = await this.limiter.hit(key, cfg.limit, cfg.windowSec * 1000);
    } catch (error) {
      this.log.error(
        'Redis unavailable, rate limiter is failing open',
        error instanceof Error ? error.stack : String(error),
      );

      return true;
    }

    res.setHeader('X-RateLimit-Limit', cfg.limit);
    res.setHeader('X-RateLimit-Remaining', result.remaining);

    if (!result.allowed) {
      res.setHeader('Retry-After', Math.ceil(result.retryAfterMs / 1000));

      throw new HttpException(
        'Too many requests',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
