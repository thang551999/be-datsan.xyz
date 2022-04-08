import { ApiProperty } from '@nestjs/swagger';
import { ROLE } from 'src/common/constant';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

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
  @Column('int', { default: 0 })
  money: number;

  @ApiProperty()
  @Column('int', { default: 1, name: 'user_type' })
  userType: number;

  @ApiProperty()
  @Column('boolean', { default: false })
  actived: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  birthday: Date;

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
}
