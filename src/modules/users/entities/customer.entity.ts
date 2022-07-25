import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Comment } from '../../comment/entities/comment.entity';
import { Order } from '../../order/entities/order.entity';
import VnpayHistory from '../../payment/entities/vnpay-history.entity';

import { UserEntity } from './user.entity';

@Entity({ name: 'customer' })
export class Customer {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ default: 0 })
  money: string;

  @OneToOne(() => UserEntity, (user) => user.customer, {
    eager: true,
  })
  @JoinTable()
  userInfo: UserEntity;

  @OneToMany(() => Comment, (comment) => comment.customer)
  comments: Comment[];

  @OneToMany(() => Order, (order) => order.customer)
  order: Order[];

  @OneToMany(() => VnpayHistory, (orderVnpay) => orderVnpay.user)
  historyChargeMoney: VnpayHistory[];
}
