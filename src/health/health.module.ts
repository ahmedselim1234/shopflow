import { Module } from '@nestjs/common';
import { HealthController } from './health.controller.js';
import { ShutdownService } from './shutdown.service.js';

@Module({
  controllers: [HealthController],
  providers: [ShutdownService],
  exports: [ShutdownService],
})
export class HealthModule {}
