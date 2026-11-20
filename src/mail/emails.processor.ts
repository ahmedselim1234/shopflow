import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { MailService } from '../mail/mail.service.js';


@Processor('emails', { concurrency: 5 })
export class EmailsProcessor extends WorkerHost {
//logger 
  private readonly log = new Logger(EmailsProcessor.name);
//resposible for send emails 
  constructor(private mail: MailService) {
    super();
  }

  async process(job: Job<{ orderId: string; to: string }>) {

    switch (job.name) {
        
      case 'order-confirmation':
        await this.mail.sendOrderConfirmation(job.data.to, job.data.orderId);
        this.log.log(`Sent confirmation for ${job.data.orderId}`);
        return;
      default:
        throw new Error(`Unknown job: ${job.name}`);
    }

  }


}
