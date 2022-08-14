import { Customer } from '../../users/entities/customer.entity';
import { Place } from '../../place/entities/place.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column()
  star: number;

  @Column()
  comment: string;

  @Column({ type: 'simple-array', nullable: true })
  commentImages: string[];

  @Column({ type: 'simple-array', nullable: true })
  commentVideos: string[];

  @CreateDateColumn()
  createAt: Date;

  @Column({ default: false })
  isDisable: boolean;

  @ManyToOne(() => Place, (place) => place.comments, { eager: true })
  place: Place;

  @ManyToOne(() => Customer, (customer) => customer.comments, { eager: true })
  customer: Customer;

  @ManyToOne(() => UserEntity, (customer) => customer.comments, {
    eager: true,
  })
  user: UserEntity;

  // many to one user
  // many to one place
}
