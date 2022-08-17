import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min, MIN } from 'class-validator';
import { TypePlace } from '../entities/type-place.entity';

export class GetPlaceParams {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(0)
  pageSize: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(0)
  page: number;

  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsString()
  address: string;

  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  limitUser: number;

  @ApiProperty({ example: 1 })
  @IsOptional()
  typePlace: string;
}

export class GetPlaceOwner {
  // @ApiProperty({ example: 1 })
  // @IsNumber()
  // @Min(0)
  // pageSize: number;

  // @ApiProperty({ example: 1 })
  // @IsNumber()
  // @Min(0)
  // page: number;

  @ApiProperty({ example: 1 })
  @IsOptional()
  name: string;
}
