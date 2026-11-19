import { Global, Module } from "@nestjs/common";

@Global()
@Module({
providers: [{
provide: 'REDIS',
useFactory: () => new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379'),
}],
exports: ['REDIS'],
})
export class RedisModule {}