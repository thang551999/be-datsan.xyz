import { ApiProperty } from '@nestjs/swagger';
import { ROLE } from 'src/common/constant';
import { OwnerPlace } from '../../owner-place/entities/owner-place.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Admin } from '../../admin/entities/admin.entity';
import { Customer } from './customer.entity';
import { FindCompetitorEntity } from '../../find-competitor/entities/find-competitor.entity';
import { ArticleEntity } from '../../article/entities/article.entity';
import { Comment } from '../../comment/entities/comment.entity';

@Entity({ name: 'user' })
export class UserEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @ApiProperty()
  @Column({ length: 50, nullable: true })
  email: string;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  password: string;

  @ApiProperty()
  @Column({ length: 50, nullable: true })
  fullName: string;

  @ApiProperty()
  @Column({
    length: 100,
    default:
      'https://res.cloudinary.com/dzbytteef/image/upload/v1632899978/default-user_ron9tg.png',
  })
  avatar: string;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  address: string;

  @ApiProperty()
  @Column({ length: 50, nullable: true })
  phone: string;

  @ApiProperty()
  @Column('enum', { default: 1, enum: ROLE })
  role: number;

  @ApiProperty()
  @Column('int', { default: 1, name: 'user_type' })
  userType: number;

  @ApiProperty()
  @Column('boolean', { default: false })
  actived: boolean;

  @ApiProperty()
  @Column('boolean', { default: false })
  approved: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  birthday: Date;

  @ApiProperty()
  @Column({ nullable: true })
  forgotPasswordCode: string;

  @ApiProperty()
  @Column({ length: 50, nullable: true, name: 'code_forgot_password' })
  codeForgotPassword: string;

  @ApiProperty({ nullable: true })
  @Column({ type: 'text', nullable: true, name: 'token_forgot_password' })
  tokenForgotPassword: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => OwnerPlace, (user) => user.userInfo, {
    cascade: true,
  })
  @JoinColumn()
  ownerPlace: OwnerPlace;

  @OneToOne(() => Admin, (user) => user.userInfo, {
    cascade: true,
  })
  @JoinColumn()
  admin: Admin;

  @OneToOne(() => Customer, (user) => user.userInfo, {
    cascade: true,
  })
  @JoinColumn()
  customer: Customer;

  @OneToMany(
    () => FindCompetitorEntity,
    (findCompetitor) => findCompetitor.user,
  )
  findCompetitors: FindCompetitorEntity[];

  @OneToMany(() => ArticleEntity, (article) => article.user)
  article: ArticleEntity[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];
}
