import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
export type Role = 'customer' | 'support' | 'admin';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) email: string;
  @Column({ type: 'varchar', nullable: true }) passwordHash: string | null;
  @Column({ type: 'varchar', default: 'customer' }) role: Role;
  @Column({ type: 'varchar', nullable: true }) name: string | null;
  @Column({ type: 'varchar', nullable: true }) provider: string | null; // 'google' (13 يوم)
  @Column({ type: 'varchar', nullable: true }) providerId: string | null;
  @CreateDateColumn() createdAt: Date;
}
