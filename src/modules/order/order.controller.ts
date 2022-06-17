import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OwnerAuthGuard, UserAuthGuard } from '../auth/jwt.strategy';
import { IUserInfo, UserInfo } from '../../common/decorators/user.decorator';
import { ORDER_MESSAGE, API_SUCCESS } from '../../common/constant';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UseGuards(UserAuthGuard)
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @UserInfo() user: IUserInfo,
  ) {
    const order = await this.orderService.create(createOrderDto, user);
    if (order == ORDER_MESSAGE.NOT_ENOUGH_MONEY)
      throw new HttpException(
        ORDER_MESSAGE.NOT_ENOUGH_MONEY,
        HttpStatus.BAD_REQUEST,
      );
    if (order == ORDER_MESSAGE.TIME_AVAILABILITY)
      throw new HttpException(
        ORDER_MESSAGE.TIME_AVAILABILITY,
        HttpStatus.BAD_REQUEST,
      );

    return {
      code: API_SUCCESS,
      data: order,
    };
  }

  // @Post('without-login')
  // async createWithOutLogin(@Body() createOrderDto: CreateOrderDto) {
  //   return this.orderService.create(createOrderDto);
  // }

  // @UseGuards(OwnerAuthGuard)
  // @Get()
  // findAll() {
  //   return this.orderService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.orderService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
  //   return this.orderService.update(+id, updateOrderDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.orderService.remove(+id);
  // }
}
