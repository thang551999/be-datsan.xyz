import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { OwnerAuthGuard, UserAuthGuard } from '../auth/jwt.strategy';
import { IUserInfo, UserInfo } from '../../common/decorators/user.decorator';

@Controller('owner/order')
@UseGuards(OwnerAuthGuard)
export class OrderOwnerController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  findOrderByOwner(@UserInfo() user: IUserInfo) {
    return this.orderService.findOrderByOwner(user);
  }

  @Get('report')
  findReport(@UserInfo() user: IUserInfo) {
    return this.orderService.getOrderReportOwner(user.relativeId);
  }

  // @Get()
  // findOrderByOwner() {
  //   return this.orderService.findOrderByOwner();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.orderService.findOne(+id);
  // }
}
