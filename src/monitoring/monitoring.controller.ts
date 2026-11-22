
import { Controller, Get } from '@nestjs/common';
import { PerformanceService } from './performance.service.js';

@Controller('monitoring')
export class MonitoringController {
  constructor(
    private readonly performanceService: PerformanceService,
  ) {}

  @Get('performance')
  getPerformance() {
    return this.performanceService.getMetrics();
  }
}
