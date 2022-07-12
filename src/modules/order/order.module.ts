import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Place } from '../place/entities/place.entity';
import { Order } from './entities/order.entity';
import { Customer } from '../users/entities/customer.entity';
import { OwnerPlace } from '../owner-place/entities/owner-place.entity';
import { HistoryBlockBooking } from './entities/history-block-booking.entity';
import SystemConfigEntity from '../admin/entities/system-config.entity';
import { OrderOwnerController } from './owner-order.controller';
import { AdminController } from './admin-order.controller';
import { ReportOrder } from './entities/report.order.entity';
import { Voucher } from '../voucher/entities/voucher.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Place,
      Order,
      Customer,
      OwnerPlace,
      HistoryBlockBooking,
      SystemConfigEntity,
      ReportOrder,
      Voucher,
    ]),
  ],
  controllers: [OrderController, OrderOwnerController, AdminController],
  providers: [OrderService],
})
export class OrderModule {}
