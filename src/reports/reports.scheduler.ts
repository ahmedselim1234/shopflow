import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { LocksService } from '../locks/locks.service.js';

// Cron Jobs: تشغيل مهمة بشكل تلقائي في وقت محدد.
// BullMQ: إرسال المهمة إلى Queue عشان تتنفذ في Background.
// Distributed Lock:   منع أكتر من Server Instance من إرسال نفس المهمة في نفس الوقت.

const yesterdayISO = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
};

@Injectable()
export class ReportsScheduler {
  constructor(
    private locks: LocksService,
    @InjectQueue('reports') private reports: Queue,
  ) {}

  @Cron('* * * * *', { timeZone: 'Africa/Cairo' })
  //   @Cron('0 2 * * *', { timeZone: 'Africa/Cairo' })
  async dailySalesReport() {
    const token = await this.locks.acquire(
      'lock:daily-sales-report',
      10 * 60_000,
    );

    //يعني نسخه تانيه حصلت علي اللوك ده
    if (!token) return;
 
    try {
      const date = yesterdayISO();
      await this.reports.add(
        'daily-sales',
        { date },
        { jobId: `daily-sales-${date}` },
      );
    } finally {
      await this.locks.release('lock:daily-sales-report', token);
    }
  }
}
