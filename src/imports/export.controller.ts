import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import  type { Response } from 'express';
import { stringify } from 'csv-stringify';
import { pipeline } from 'node:stream/promises';
import { Repository } from 'typeorm';
import { DevAuthGuard } from '../auth/dev-auth.guard.js';
import { Order } from '../orders/order.entity.js';


@Controller('admin/orders')
@UseGuards(DevAuthGuard)
export class ExportController {

  constructor(@InjectRepository(Order) private orderRepo: Repository<Order>) {}
 
  @Get('export')
  async export(@Res() res: Response) {

    res.setHeader('Content-Type', 'text/csv');

    res.setHeader('Content-Disposition', 'attachment; filename="orders.csv"');
    
    const rows = await this.orderRepo
      .createQueryBuilder('o')
      .select([
        'o.id AS id',
        'o.userId AS user_id',
        'o.status AS status',
        'o.totalCents AS total_cents',
        'o.createdAt AS created_at',
      ])
      //بتقرأ النتائج تدريجيًا باستخدام
      .stream(); 
      // تحويل البيانات إلى CSV
    await pipeline(rows, stringify({ header: true }), res);
  }
}
