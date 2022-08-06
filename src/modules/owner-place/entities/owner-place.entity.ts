import { UserEntity } from 'src/modules/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Place } from '../../place/entities/place.entity';
import { Voucher } from '../../voucher/entities/voucher.entity';

@Entity('owner-place')
export class OwnerPlace {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column()
  address: string;

  // @Column()
  // fullName: string;

  // @Column()
  // start: string;

  @Column({ default: false })
  active: boolean;

  @Column()
  phone: string;

  @Column()
  stk: string;

  @Column()
  bankSymbol: string;

  @Column({ default: '0' })
  money: string;

  @OneToOne(() => UserEntity, (user) => user.ownerPlace)
  @JoinColumn()
  userInfo: UserEntity;

  @OneToMany(() => Place, (place) => place.owner)
  places: Place[];

  @OneToMany(() => Voucher, (voucher) => voucher.owner)
  voucherCreate: Voucher[];
}
