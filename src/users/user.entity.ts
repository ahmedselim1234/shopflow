import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) email: string;
  @Column({ type: 'varchar', nullable: true }) passwordHash: string | null;
  @Column({ type: 'varchar', default: 'customer' }) role:
    'customer' | 'support' | 'admin';
}
// src/products/product.entity.ts
@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() name: string;
  @Column({ type: 'int' }) priceCents: number; // اﻟﻔﻠﻮس Integer داﻳﻤ ًﺎ، ﻣﺎ float ﺗﺴﺘﺨﺪﻣ
  @Column({ type: 'int' }) stock: number;
  @VersionColumn() version: number;
  @UpdateDateColumn({ type: 'datetime2', precision: 3 }) updatedAt: Date;
}
// src/orders/order.entity.ts
export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'CANCELLED';
@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Index() @Column('uuid') userId: string;
  @Column({ type: 'varchar', default: 'PENDING' }) status: OrderStatus;
  @Column({ type: 'int', default: 0 }) totalCents: number;
  @OneToMany(() => OrderItem, (i) => i.order, { cascade: true })
  items: OrderItem[];
  @CreateDateColumn({
    type: 'datetime2',
    precision: 3,
    default: () => 'SYSUTCDATETIME()',
  })
  createdAt: Date;
}
@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid') id: string;
  @ManyToOne(() => Order, (o) => o.items, { onDelete: 'CASCADE' }) order: Order;
  @Index() @Column('uuid') productId: string;
  @Column({ type: 'int' }) quantity: number;
  @Column({ type: 'int' }) unitPriceCents: number;
}
