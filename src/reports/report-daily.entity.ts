import { Column, Entity, PrimaryColumn } from 'typeorm';


@Entity('reports_daily')
export class ReportDaily {
  @PrimaryColumn({ type: 'date' }) date: string;
  @Column({ type: 'int' }) ordersCount: number;
  @Column({ type: 'bigint' }) revenueCents: string;
  
}
