import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import BigNumber from 'bignumber.js';
import { getConnection, Repository, LessThan } from 'typeorm';
import { ORDER_STATUS, PayemntOwnerOrder } from '../../common/constant';
import { Order } from '../order/entities/order.entity';
import { OwnerPlace } from '../owner-place/entities/owner-place.entity';
import { Place } from '../place/entities/place.entity';
import { subDays } from 'date-fns';
import SystemConfigEntity from '../admin/entities/system-config.entity';
@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Place)
    private placeRepository: Repository<Place>,
    @InjectRepository(Order)
    private orderPlaceRepository: Repository<Order>,
    @InjectRepository(OwnerPlace)
    private onwerPlaceRepository: Repository<OwnerPlace>,
    @InjectRepository(SystemConfigEntity)
    private systemCORepository: Repository<SystemConfigEntity>,
  ) {}
  private readonly logger = new Logger(TasksService.name);

  @Cron(CronExpression.EVERY_DAY_AT_11PM)
  async handleCron() {
    const systemConfig = await this.systemCORepository.findOneBy({});
    const day = subDays(new Date(), systemConfig.dateRefundMoney);
    const orders = await this.orderPlaceRepository.find({
      relations: ['place'],
      where: {
        isPayOwner: PayemntOwnerOrder.PaymentWait,
        status: ORDER_STATUS.OK,
        dayOrderDateType: LessThan(day),
      },
    });
    for (let index = 0; index < orders.length; index++) {
      const order = orders[index];
      const connection = getConnection();
      const queryRunner = connection.createQueryRunner();

      await queryRunner.connect();
      await queryRunner.startTransaction();
      try {
        const owner = await this.onwerPlaceRepository.findOne({
          where: {
            id: order.place.owner.id,
          },
        });
        await this.onwerPlaceRepository.update(
          { id: owner.id },
          {
            money: new BigNumber(owner.money)
              .plus(new BigNumber(order.totalPrice))
              .toString(),
          },
        );
        await this.orderPlaceRepository.update(
          { id: order.id },
          { isPayOwner: PayemntOwnerOrder.PaymentDone },
        );
      } catch (error) {
        console.log(error);
        await queryRunner.rollbackTransaction();
      } finally {
        await queryRunner.release();
      }
    }
  }
}
