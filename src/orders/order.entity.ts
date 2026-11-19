import { Column, CreateDateColumn, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'CANCELLED';

@Entity('orders')
export class Order {
@PrimaryGeneratedColumn('uuid') id: string;
@Index() @Column('uuid') userId: string;
@Column({ type: 'varchar', default: 'PENDING' }) status: OrderStatus;
@Column({ type: 'int', default: 0 }) totalCents: number;
@OneToMany(() => OrderItem, (i) => i.order, { cascade: true }) items: OrderItem[];
@CreateDateColumn() createdAt: Date;
}



@Entity('order_items')
export class OrderItem {
@PrimaryGeneratedColumn('uuid') id: string;
@ManyToOne(() => Order, (o) => o.items, { onDelete: 'CASCADE' }) order: Order;
@Index() @Column('uuid') productId: string;
@Column({ type: 'int' }) quantity: number;
@Column({ type: 'int' }) unitPriceCents: number;
}


