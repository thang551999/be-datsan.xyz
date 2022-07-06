import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import BigNumber from 'bignumber.js';
import { getConnection, Repository } from 'typeorm';
import {
  ORDER_MESSAGE,
  ORDER_STATUS,
  TypeOrder,
  TypeVoucher,
} from '../../common/constant';
import SystemConfigEntity from '../admin/entities/system-config.entity';
import { OwnerPlace } from '../owner-place/entities/owner-place.entity';
import { Place } from '../place/entities/place.entity';
import { Customer } from '../users/entities/customer.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { HistoryBlockBooking } from './entities/history-block-booking.entity';
import { Order } from './entities/order.entity';
import { ReportOrder } from './entities/report.order.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Place)
    private placeRepository: Repository<Place>,
    @InjectRepository(Order)
    private orderPlaceRepository: Repository<Order>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(OwnerPlace)
    private onwerPlaceRepository: Repository<OwnerPlace>,
    @InjectRepository(HistoryBlockBooking)
    private historyBlockRepository: Repository<HistoryBlockBooking>,
    @InjectRepository(SystemConfigEntity)
    private systemConfigRepository: Repository<SystemConfigEntity>,
    @InjectRepository(ReportOrder)
    private reportOrdergRepository: Repository<ReportOrder>,
  ) {}

  async createReportOrder(createOrderDto) {
    const reportOrder = await this.reportOrdergRepository.create(
      createOrderDto,
    );
    await this.reportOrdergRepository.save(reportOrder);
  }

  async create(createOrderDto: CreateOrderDto, userInfor) {
    const { money, place, moneyTimes, timeBlocks } = await this.calcPrice(
      createOrderDto,
    );
    const resApplyVoucher = await this.ApplyVoucher(createOrderDto);
    if (resApplyVoucher == 'Apply voucher Fail') {
      return { message: 'Apply voucher fail' };
    }
    const totalPrice = new BigNumber(money)
      .minus(new BigNumber(resApplyVoucher.moneyDown))
      .plus(new BigNumber(resApplyVoucher.gasFee))
      .toString();
    const downPrice = new BigNumber(resApplyVoucher.moneyDown).toString();
    const user = await this.customerRepository.findOne({
      where: {
        id: userInfor.relativeId,
      },
    });
    if (new BigNumber(user.money).isLessThan(new BigNumber(money)))
      return ORDER_MESSAGE.NOT_ENOUGH_MONEY;
    if (
      await this.checkExitOrder(
        createOrderDto.orderDay,
        createOrderDto.timeBooks,
      )
    ) {
      return ORDER_MESSAGE.TIME_AVAILABILITY;
    }
    const connection = getConnection();
    const queryRunner = connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await this.orderPlaceRepository.create({
        money: new BigNumber(money).toString(),
        customer: user,
        place: createOrderDto.place,
        dayOrder: createOrderDto.orderDay,
        dayOrderDateType: new Date(createOrderDto.orderDay),
        status: ORDER_STATUS.OK,
        phoneNumber: createOrderDto.phoneNumber,
        type: TypeOrder.PaymentWithWallet,
        timeBlocks: timeBlocks,
        historyServices: createOrderDto.services,
        totalPrice,
        downPrice,
        voucherOrder: resApplyVoucher.correctVoucher,
        gasFee: resApplyVoucher.gasFee,
      });
      await this.orderPlaceRepository.save(order);
      // await this.onwerPlaceRepository.update(
      //   { id: place.owner.id },
      //   {
      //     money: new BigNumber(place.owner.money)
      //       .plus(new BigNumber(totalPrice))
      //       .toString(),
      //   },
      // );
      await this.customerRepository.update(
        { id: user.id },
        {
          money: new BigNumber(user.money)
            .minus(new BigNumber(money))
            .toString(),
        },
      );
      await queryRunner.manager.save(order);
      // await queryRunner.manager.save(updateMoney);
      await queryRunner.commitTransaction();
      return order;
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
    return { error: 'error' };
  }
  async calcPrice(createOrderDto) {
    const place = await this.placeRepository.findOne({
      where: { id: createOrderDto.place.id },
      relations: ['timeGold', 'owner', 'voucherCreate'],
    });
    const { moneyTimes, timeBlocks } = this.getPriceTimes(
      createOrderDto.timeBooks,
      place.timeGold,
      place.priceMin,
      createOrderDto.orderDay,
      place,
    );
    const priceServices = this.getPriceServices(createOrderDto.services);
    const money = new BigNumber(moneyTimes)
      .plus(new BigNumber(priceServices))
      .toString();
    return { money, place, moneyTimes, timeBlocks };
  }

  getPriceServices(services) {
    return services.reduce(
      (moneny, service) => {
        return new BigNumber(service.price)
          .plus(new BigNumber(moneny))
          .toString();
      },

      '0',
    );
  }

  getPriceTimes(times, timeGold, priceMin, dayOrder, place) {
    let money = '0';
    const timeBlocks = times.map((time) => {
      const price = this.getPriceTimeBlock(timeGold, time, priceMin);
      money = new BigNumber(money).plus(new BigNumber(price)).toString();
      return {
        timeStart: time,
        dayOrder,
        price,
        place,
      };
    });
    return {
      timeBlocks,
      moneyTimes: money,
    };
  }

  getPriceTimeBlock(timeGold, timeStart, priceMin) {
    let money = '';
    const isTimeGold = timeGold.find(
      (e) => e.timeStart == timeStart.toString(),
    );
    if (isTimeGold) {
      money = isTimeGold.price;
    } else {
      money = priceMin;
    }
    return money;
  }

  async ApplyVoucher(orderInfor) {
    const { money, place, moneyTimes, timeBlocks } = await this.calcPrice(
      orderInfor,
    );
    const systemConfig = await this.systemConfigRepository.find();
    const resApplyVoucher = this.checkVoucher(
      orderInfor.voucher,
      place,
      money,
      systemConfig[0]?.gasFee ? systemConfig[0].gasFee : '0',
    );
    if (resApplyVoucher == 'Max voucher') {
      return 'Apply voucher Fail';
    }

    return resApplyVoucher;
  }

  checkVoucher(voucher, place, money, gasFee) {
    const correctVoucher = [];
    let moneyDown = '0';

    voucher.map((v) => {
      const a = place.voucherCreate.find((vc) => vc.id === v.id);
      if (a) {
        if (a.type === TypeVoucher.Percent) {
          if (
            new BigNumber(money)
              .multipliedBy(a.value / 100)
              .isGreaterThan(new BigNumber(a.maxMoneySale))
          ) {
            moneyDown = new BigNumber(moneyDown)
              .plus(new BigNumber(a.maxMoneySale))
              .toString();
            correctVoucher.push({ voucher: a, status: 1, value: moneyDown });
          } else {
            moneyDown = new BigNumber(moneyDown)
              .plus(new BigNumber(money).multipliedBy(a.value / 100))
              .toString();
            correctVoucher.push({ voucher: a, status: 1, value: moneyDown });
          }
        } else {
          if (
            new BigNumber(a.value).isGreaterThan(new BigNumber(a.maxMoneySale))
          ) {
            moneyDown = new BigNumber(moneyDown)
              .plus(new BigNumber(a.maxMoneySale))
              .toString();
            correctVoucher.push({ voucher: a, status: 1, value: moneyDown });
          } else {
            moneyDown = new BigNumber(moneyDown)
              .plus(new BigNumber(a.value))
              .toString();
            correctVoucher.push({ voucher: a, status: 1, value: moneyDown });
          }
        }
      }
    });
    if (correctVoucher.length > place.maxVoucherCanUse) return 'Max voucher';

    return {
      money,
      correctVoucher,
      moneyDown,
      gasFee: new BigNumber(money).multipliedBy(gasFee / 100).toString(),
    };
  }

  async checkExitOrder(day, timeBlock) {
    const historyBlock = await this.historyBlockRepository.findBy({
      dayOrder: day,
    });
    if (historyBlock.length == 0) {
      return false;
    }
    for (let index = 0; index < timeBlock.length; index++) {
      const element = timeBlock[index];
      if (historyBlock.find((his) => his.timeStart === element)) return true;
    }
    return false;
  }
  async findAll() {
    return this.orderPlaceRepository.find({
      relations: [
        'customer',
        'place',
        'historyServices',
        'timeBlocks',
        'voucherOrder',
      ],
    });
  }

  async findOrderByOwner(user) {
    const oder = await this.orderPlaceRepository.find({
      where: {
        place: {
          owner: {
            id: user.relativeId,
          },
        },
      },
      relations: [
        'customer',
        'place',
        'historyServices',
        'timeBlocks',
        'voucherOrder',
      ],
    });
    console.log(oder);
    return oder;
  }

  async findHistoryOrderList(getParams, user) {
    const orderList = await this.orderPlaceRepository.findAndCount({
      relations: [
        'customer',
        'place',
        'historyServices',
        'timeBlocks',
        'voucherOrder',
      ],
      where: {
        customer: {
          id: user.relativeId,
        },
      },
      skip: (getParams.page - 1) * getParams.pageSize,
      take: getParams.pageSize,
    });
    return {
      total: orderList[1],
      pageSize: getParams.pageSize,
      currentPage: getParams.page,
      records: orderList[0],
    };
  }

  async getAdminReportOrder() {
    return this.reportOrdergRepository.findBy({});
  }

  async getOrderReportOwner(id) {
    return this.reportOrdergRepository.findBy({
      order: {
        place: {
          owner: {
            id,
          },
        },
      },
    });
  }
}
