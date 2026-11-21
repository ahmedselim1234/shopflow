import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportDaily } from './report-daily.entity.js';
import { ReportsProcessor } from './reports.processor.js';
import { ReportsScheduler } from './reports.scheduler.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReportDaily]),
    BullModule.registerQueue({ name: 'reports' }),
  ],
  providers: [ReportsScheduler, ReportsProcessor],
})
export class ReportsModule {}
