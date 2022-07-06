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

  @OneToOne(() => Order, (order) => order.report)
  @JoinColumn()
  order: Order;
}
