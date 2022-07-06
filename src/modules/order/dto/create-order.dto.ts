import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MaxLength,
  IsEnum,
  IsOptional,
  IsArray,
  IsNotEmpty,
  IsEmpty,
  IsNumber,
} from 'class-validator';
import { TypeOrder } from '../../../common/constant';
import { IsDateStringFormat } from '../../../common/validate.decorator';
import { Place } from '../../place/entities/place.entity';
import { Order } from '../entities/order.entity';

export class CreateOrderDto {
  @ApiProperty({ required: true, example: 'Lãng Yên hai bà trung' })
  @IsString()
  @MaxLength(10)
  phoneNumber: string;

  @ApiProperty({ required: true, example: 'Lãng Yên hai bà trung' })
  @IsNotEmpty()
  place: Place;

  @ApiProperty({
    example: '2022/03/10',
    description: 'Format: MM/DD/YYYY HH:mm:ss',
    required: false,
  })
  @IsString()
  orderDay: string;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  voucher;

  @IsArray()
  timeBooks: string[];

  @IsArray()
  services;
}

export class GetOrderHistory {
  @IsNumber()
  page: number;

  @IsNumber()
  pageSize: number;
}

export class ReportOrderDto {
  @IsArray()
  images: string[];

  @IsString()
  content: string;

  @IsNotEmpty()
  order: Order;
}
