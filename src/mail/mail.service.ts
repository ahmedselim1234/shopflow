import { Injectable, Logger } from "@nestjs/common";
import { sleep } from "../common/sleep.js";


@Injectable()
export class MailService {

  private readonly log = new Logger(MailService.name);
  
  async sendOrderConfirmation(to: string, orderId: string) {
    await sleep(3000);   // بنحاكي SMTP بطيء
    this.log.log(`Email sent to ${to} for order ${orderId}`);
  }

}