import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';

@Entity('products')
export class Product {

  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() name: string;
  @Column({ type: 'int' }) priceCents: number;
  @Column({ type: 'int' }) stock: number;
  @VersionColumn() version: number;
  @UpdateDateColumn() updatedAt: Date;
  
}
