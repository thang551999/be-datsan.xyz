import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Comment } from '../../comment/entities/comment.entity';
import { OwnerPlace } from '../../owner-place/entities/owner-place.entity';
import { ServicePlace } from './service-place.entity';
import { TimeGold } from './time-gold.entity';
import { TypePlace } from './type-place.entity';
import { Voucher } from '../../voucher/entities/voucher.entity';
import { Order } from '../../order/entities/order.entity';
import { HistoryBlockBooking } from '../../order/entities/history-block-booking.entity';
import { DateOff } from './place-date-off.entity';

@Entity({ name: 'places' })
export class Place {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ length: 250, name: 'address-place' })
  address: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'point', default: 100 })
  point: number;

  @Column({ default: 100 })
  maxVoucherCanUse: number;

  // @Column({ type: 'simple-array', name: 'imageBanner' })
  // imageBanner: string;

  @Column({ type: 'simple-array', name: 'imageDetails' })
  imageDetails: string;

  @Column({ name: 'timeOpen' })
  timeOpen: string;

  @Column()
  name: string;

  @Column({ name: 'priceMin' })
  priceMin: string;

  @Column({ name: 'isEnable', default: true })
  isEnable: boolean;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ name: 'timeClose' })
  timeClose: string;

  @Column({ name: 'limit-users', nullable: true })
  limitUsers: number;

  @CreateDateColumn()
  createAt: Date;

  @Column({ default: '5' })
  star: number;

  @UpdateDateColumn()
  updateAt: Date;

  @Column({ nullable: true })
  timeDistance: number;

  @ManyToOne(() => OwnerPlace, (ownerPlace) => ownerPlace.places, {
    eager: true,
  })
  @JoinColumn()
  owner: OwnerPlace;

  @ManyToOne(() => TypePlace, (typePlace) => typePlace.place)
  typePlace: TypePlace;
  //one to many bang time vip
  @OneToMany(() => TimeGold, (timeGold) => timeGold.place, {
    cascade: true,
    eager: true,
  })
  timeGold: TimeGold[];

  //one to many dich vu
  @OneToMany(() => ServicePlace, (service) => service.place, {
    cascade: true,
    eager: true,
  })
  services: ServicePlace[];

  //one to many comment place
  @OneToMany(() => Comment, (comment) => comment.place)
  comments: Comment[];

  @OneToMany(() => Voucher, (voucher) => voucher.place)
  voucherCreate: Voucher[];

  @OneToMany(() => Order, (order) => order.place)
  order: Order[];

  @OneToMany(
    () => HistoryBlockBooking,
    (historyBlockBooking) => historyBlockBooking.place,
  )
  timeBooking: HistoryBlockBooking[];

  @OneToMany(() => DateOff, (dayOff) => dayOff.place)
  dateOff: DateOff[];
}
