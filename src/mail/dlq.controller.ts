import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { DevAuthGuard } from '../auth/dev-auth.guard.js';
import { EMAIL_JOB_OPTIONS } from './email-job-options.js';


@Controller('admin/dlq')
@UseGuards(DevAuthGuard)
export class DlqController {
  constructor(
    @InjectQueue('dlq-emails') private dlq: Queue,
    @InjectQueue('emails') private emails: Queue,
  ) {}
  @Get()
  list() {
    return this.dlq.getJobs(['waiting', 'delayed', 'completed'], 0, 50);
  }
  @Post(':id/retry')
  async retry(@Param('id') id: string) {
    const dead = await this.dlq.getJob(id);
    if (!dead) throw new NotFoundException();
    await this.emails.add(dead.data.name, dead.data.data, EMAIL_JOB_OPTIONS);
    await dead.remove();
    return { requeued: true };
  }
}
