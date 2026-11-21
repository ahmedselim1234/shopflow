import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ShutdownService } from './shutdown.service.js';
import { sleep } from '../common/sleep.js';

@Controller('health')
export class HealthController {
  constructor(private shutdown: ShutdownService) {}

  @Get('live') live() {
    return { status: 'ok' };
  }

  @Get('ready')
  ready() {
    if (this.shutdown.isShuttingDown()) throw new ServiceUnavailableException();
    return { status: 'ok' };
  }
  // Endpoint (امسحه بعدين) بطيء للتجربة بس
  @Get('slow') async slow() {
    await sleep(10_000);
    return { done: true };
  }
}
