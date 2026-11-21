import {
  BeforeApplicationShutdown,
  Injectable,
  Logger,
  OnApplicationShutdown,
} from '@nestjs/common';
import { sleep } from '../common/sleep.js';


@Injectable()
export class ShutdownService
  implements BeforeApplicationShutdown, OnApplicationShutdown
{
  private readonly log = new Logger('Shutdown');

  private shuttingDown = false;

  isShuttingDown() {
    return this.shuttingDown;
  }

  async beforeApplicationShutdown(signal?: string) {
    this.shuttingDown = true; 
    this.log.warn(`Received ${signal}, draining...`);
    await sleep(Number(process.env.DRAIN_MS ?? 5000));
  }

  async onApplicationShutdown(signal?: string) {
    this.log.warn(`Shutdown complete (${signal})`);
  }
}
