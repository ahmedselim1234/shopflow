import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { MailService } from "./mail.service.js";

@Processor('emails', { concurrency: 5 })
export class EmailsProcessor extends WorkerHost {
private readonly log = new Logger(EmailsProcessor.name);
constructor(private mail: MailService) { super(); }
}

async process(job: Job<{ orderId: string; to: string }>) {
switch (job.name) {
case 'order-confirmation':
await this.mail.sendOrderConfirmation(job.data.to, job.data.orderId);
this.log.log(`Sent confirmation for ${job.data.orderId}`);
return;
default:
    throw new Error(`Unknown job ${Job.name}`);
}}}