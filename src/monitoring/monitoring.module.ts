
import { Module } from '@nestjs/common';
import { PerformanceService } from './performance.service.js';
import { MonitoringController } from './monitoring.controller.js';

@Module({
  controllers: [MonitoringController],
  providers: [PerformanceService],
  exports: [PerformanceService],
})
export class MonitoringModule {}
