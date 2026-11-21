import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bullmq';
import { parse } from 'csv-parse';
import { createReadStream } from 'node:fs';
import { unlink } from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';
import { Repository } from 'typeorm';
import { Product } from '../products/product.entity.js';


@Processor('imports')
export class ImportsProcessor extends WorkerHost {

  private readonly log = new Logger(ImportsProcessor.name);

  constructor(@InjectRepository(Product) private repo: Repository<Product>) {
    super();
  }

  async process(job: Job<{ path: string }>) {

  this.log.log(`Started import job: ${job.id}`);

    let batch: Partial<Product>[] = [];
    let total = 0;
    let skipped = 0;

    try {
      await pipeline(
        createReadStream(job.data.path), // بيقرا حتة حتة
        parse({
          //أول صف هو أسماء الأعمدة
          columns: true,
          //بيشيل المسافات الزائدة.
          trim: true,
          //يتخطى الصفوف اللي فيها أخطاء
          skip_records_with_error: true,
          on_skip: (err) => {
            skipped++;
            this.log.warn(`Skipped bad row: ${err?.message}`);
          },
        }),
        async (rows) => {
   
          for await (const row of rows) {
            batch.push({
              name: row.name,
              priceCents: Math.round(Number(row.price) * 100),
              stock: Number(row.stock),
            });
            if (batch.length >= 1000) {
              await this.repo.insert(batch); // الـ await هنا هو الـ Backpressure
              total += batch.length;
              batch = [];
            }
          }
          if (batch.length) {
            await this.repo.insert(batch);
            total += batch.length;
          }
        },
      );

    } finally {

      await unlink(job.data.path).catch(() => undefined); // امسح الملف المؤقت
      
    }
      this.log.log(`Import completed: ${total}`);

    return { imported: total, skipped };
  }
}
