
import {
  InjectQueue,
  OnWorkerEvent,
  Processor,
  WorkerHost,
} from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job, Queue, UnrecoverableError } from 'bullmq';
import { MailService } from '../mail/mail.service.js';

const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e ?? '');

@Processor('emails', { concurrency: 5 })
export class EmailsProcessor extends WorkerHost {
  
  private readonly log = new Logger(EmailsProcessor.name);
  
  constructor(
    private mail: MailService,
    //to add jobs that didnt work ever 
    @InjectQueue('dlq-emails') private dlq: Queue,
  ) {
    super();
  }
   
    
async process(job: Job<{ orderId: string; to: string }>) {
    if (!isValidEmail(job.data.to)) {
      throw new UnrecoverableError('Invalid email address'); // مفيش فايدة من اإلعادة: افشل فورًا
    }
    await this.mail.sendOrderConfirmation(job.data.to, job.data.orderId); // أي Error عادي = Retry
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job | undefined, err: Error) {
    if (!job) return;
    const exhausted = job.attemptsMade >= (job.opts.attempts ?? 1);

    if (exhausted || err instanceof UnrecoverableError) {
      await this.dlq.add('dead-email', {
        name: job.name,
        data: job.data,
        reason: err.message,
        failedAt: new Date().toISOString(),
      });
      this.log.error(`Job ${job.id} moved to DLQ: ${err.message}`);
    }
  }
}
