import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from './order.entity';

@Entity({ name: 'report-order' })
export class ReportOrder {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ nullable: true, type: 'simple-array' })
  images: string[];

  @Column({ nullable: true })
  content: string;

  @Column({ nullable: true, default: '0' })
  status: string;

  @OneToOne(() => Order, (order) => order.report, { eager: true })
  @JoinColumn()
  order: Order;
}
