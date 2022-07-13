import { ApiProperty, PickType } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { ROLE } from '../../../common/constant';

export class RegisterUserDto {
  @ApiProperty({ example: 'hello' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'hello' })
  @IsEmail({})
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'hello' })
  @IsEnum(ROLE)
  @IsNotEmpty()
  role: number;

  @ApiProperty({ example: {} })
  @IsOptional()
  ownerPlace;

  @ApiProperty({ example: {} })
  @IsOptional()
  admin;
}
export class ResRegisterDto {
  @ApiProperty({ example: 'Thành Công' })
  message: string;
}
export class ResUserInfoDto extends PickType(UserEntity, [
  'id',
  'avatar',
  'email',
  'fullName',
  'phone',
  'role',
  'address',
  'role',
]) {}
