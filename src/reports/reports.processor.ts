import { Processor, WorkerHost } from '@nestjs/bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bullmq';
import { DataSource, Repository } from 'typeorm';
import { ReportDaily } from './report-daily.entity.js';

// DataSource => بيسمحلنا نكتب كويريز علي الداتا بيز مباشره
@Processor('reports')
export class ReportsProcessor extends WorkerHost {

  constructor(
    private ds: DataSource,
    @InjectRepository(ReportDaily) private repo: Repository<ReportDaily>,
  ) {
    super();
  }

  async process(job: Job<{ date: string }>) {

    const { date } = job.data;
    // SQL Query => to claculate sales
    const [row] = await this.ds.query(
      `SELECT COUNT(*)::int AS orders,
       COALESCE(SUM("totalCents"), 0)::bigint AS revenue
       FROM orders
       WHERE "createdAt" >= $1::date
        AND "createdAt" < ($1::date + 1) AND 
        status <> 'CANCELLED'`,
      [date],
    );
// save report in db
    await this.repo.upsert(
      { date, ordersCount: row.orders, revenueCents: row.revenue },
      ['date'],
    );
  }
}
