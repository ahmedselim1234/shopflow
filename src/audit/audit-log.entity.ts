import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('audit_logs')
@Index(['entityType', 'entityId'])
@Index(['actorId', 'createdAt'])
export class AuditLog {
  
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'uuid', nullable: true }) actorId: string | null;
  @Column() action: string;                               
  @Column() entityType: string;
  @Column({ type: 'varchar', nullable: true }) entityId: string | null;
  @Column({ type: 'varchar' }) outcome: 'SUCCESS' | 'FAILURE';
  @Column({ type: 'jsonb', nullable: true }) metadata: Record<string, unknown> | null;
  @Column({ type: 'varchar', nullable: true }) ip: string | null;
  @Column({ type: 'varchar', nullable: true }) userAgent: string | null;
  @Column({ type: 'varchar', nullable: true }) requestId: string | null;
  @CreateDateColumn({ type: 'timestamptz' }) createdAt: Date;
}