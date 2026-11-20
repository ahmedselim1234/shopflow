import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('idempotency_keys')
export class IdempotencyKey {
  @PrimaryColumn() key: string;
  @PrimaryColumn('uuid') userId: string;
  @Column() requestHash: string;
  @Column({ default: 'processing' }) status: 'processing' | 'completed';
  @Column({ type: 'jsonb', nullable: true }) response: unknown;
  @CreateDateColumn() createdAt: Date;
}
