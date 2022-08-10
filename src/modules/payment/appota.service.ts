import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import {
  CreatePaymentDto,
  CreateAppotaDto,
  GetParams,
} from './dto/create-vnpay.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, getConnection, Repository } from 'typeorm';
import * as CryptoJS from 'crypto-js';
import { UserEntity } from '../users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { AxiosRequestConfig } from 'axios';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ReturnIPNDto } from './dto/return-ipn.dto';
import { OrderStatus, PaymentStatus } from '../../common/constant';
import { Order } from '../order/entities/order.entity';
import { Customer } from '../users/entities/customer.entity';
import * as qs from 'qs';
import * as crypto from 'crypto';
import { format } from 'date-fns';
import * as date from 'date-and-time';
import VnpayHistory from './entities/vnpay-history.entity';
import BigNumber from 'bignumber.js';

@Injectable()
export class AppotaService {
  @InjectRepository(VnpayHistory)
  private vnpayTable: Repository<VnpayHistory>;
  @InjectRepository(Order)
  private orderTableResponse: Repository<Order>;
  @InjectRepository(UserEntity)
  private userRepository: Repository<UserEntity>;

  @InjectRepository(Customer)
  private customerRepository: Repository<Customer>;
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}
  async getPaymentAdmin(getParams: GetParams) {
    const historyPayment = await this.vnpayTable.findAndCount({
      relations: ['user'],
      where: {
        status: PaymentStatus.SUCCESS,
        createdAt: Between(
          new Date(getParams.dateStart),
          new Date(getParams.dateEnd),
        ),
      },
      skip: (getParams.page - 1) * getParams.pageSize,
      take: getParams.pageSize,
    });
    const userInfor = await Promise.all(
      historyPayment[0].map((h) =>
        this.userRepository.findOne({
          where: {
            customer: {
              id: h.user.id,
            },
          },
          select: {
            email: true,
            fullName: true,
            avatar: true,
            address: true,
            phone: true,
            id: true,
            customer: {
              id: true,
            },
          },
        }),
      ),
    );
    return {
      total: historyPayment[1],
      pageSize: getParams.pageSize,
      currentPage: getParams.page,
      records: historyPayment[0].map((h, index) => {
        return { ...h, ...userInfor[index] };
      }),
    };
  }

  async returnIPN(req: ReturnIPNDto) {
    // const dataSignature = `amount=${req.amount}&apiKey=${req.apiKey}&appotapayTransId=${req.appotapayTransId}&bankCode=${req.bankCode}&currency=${req.currency}&errorCode=${req.errorCode}&extraData=${req.extraData}&message=${req.message}&orderId=${req.orderId}&partnerCode=${req.partnerCode}&paymentMethod=${req.paymentMethod}&paymentType=${req.paymentType}&transactionTs=${req.transactionTs}`;
    // const hmac = CryptoJS.enc.Hex.stringify(
    //   CryptoJS.HmacSHA256(dataSignature, process.env.appotaSecretKey),
    // );
    // if (hmac === req.signature) {
    //   if (req.errorCode === 0) {
    //     const order = await this.orderTable.findOne(req.orderId, {
    //       relations: ['user'],
    //     });
    //     if (order.status == '0') {
    //       const connection = getConnection();
    //       const queryRunner = connection.createQueryRunner();
    //       await queryRunner.connect();
    //       await queryRunner.startTransaction();
    //       try {
    //         const updateOrder = await this.orderTable.update(order.id, {
    //           status: '1',
    //           transactionTs: req.transactionTs,
    //           appotapayTransId: req.appotapayTransId,
    //           errrorCode: req.errorCode,
    //           extraData: req.extraData,
    //           //  message:req.message
    //         });
    //         const updateMonney = await this.userRepository.update(
    //           order.user.id,
    //           {
    //             money: order.user.money + req.amount,
    //           },
    //         );
    //         await queryRunner.manager.save(updateOrder);
    //         await queryRunner.manager.save(updateMonney);
    //         await queryRunner.commitTransaction();
    //         return { status: 'ok' };
    //       } catch (error) {
    //         console.log(error);
    //         await queryRunner.rollbackTransaction();
    //       } finally {
    //         await queryRunner.release();
    //       }
    //     } else {
    //       throw new BadRequestException(500, `Da duoc update`);
    //     }
    //   }
    //   throw new BadRequestException(500, `Thanh toan that bai`);
    // } else {
    //   throw new BadRequestException(500, `Sai Chu Ky`);
    // }
  }

  async historyCharge(id) {
    const charge = await this.vnpayTable.findOne({
      // relations: ['user'],
      // where: { id, user: { id: userId } },
      where: {
        id,
      },
    });
    if (charge) {
      return {
        money: charge.money,
        status: charge.status,
        // appotapayTransId: charge.appotapayTransId,
        // transactionTs: charge.transactionTs,
        // createdAt: charge.createdAt,
        // extraData: charge.extraData,
        // errorCode: charge.errrorCode,
      };
    }
    return {};
  }
  returnUrl(query, res) {
    try {
      console.log(query);
      if (query.vnp_ResponseCode != '00') {
        res.redirect(`${process.env.FE_USER_URL}/charge/error`);
      } else {
        res.redirect(`${process.env.FE_USER_URL}/charge/result`);
      }
      // var vnp_Params = req.query;
      // var secureHash = vnp_Params['vnp_SecureHash'];

      // delete vnp_Params['vnp_SecureHash'];
      // delete vnp_Params['vnp_SecureHashType'];

      // vnp_Params = this.sortObject(vnp_Params);

      // var tmnCode = process.env.vnp_TmnCode;
      // var secretKey = process.env.vnp_HashSecret;

      // var querystring = require('qs');
      // var signData =
      //   secretKey + querystring.stringify(vnp_Params, { encode: false });

      // var sha256 = require('sha256');

      // var checkSum = sha256(signData);
      // console.log(vnp_Params);

      // if (secureHash === checkSum) {
      //   if (vnp_Params.vnp_ResponseCode === '00') {
      //     return res.redirect(
      //       `https://thegioifitness.com/payment/success/index?amount=${vnp_Params['vnp_Amount']}&&vnp_TxnRef=${vnp_Params['vnp_TxnRef']}&&vnp_TransactionNo=${vnp_Params['vnp_TransactionNo']}&&vnp_ResponseCode=${vnp_Params['vnp_ResponseCode']}&&vnp_PayDate=${vnp_Params['vnp_PayDate']}`,
      //     );
      //   } else {
      //     return res.redirect(
      //       `https://thegioifitness.com/payment/fail/index?amount=${vnp_Params['vnp_Amount']}&&vnp_TxnRef=${vnp_Params['vnp_TxnRef']}&&vnp_TransactionNo=${vnp_Params['vnp_TransactionNo']}&&vnp_ResponseCode=${vnp_Params['vnp_ResponseCode']}&&vnp_PayDate=${vnp_Params['vnp_PayDate']}`,
      //     );
      //   }

      //   //res.sendFile(path.join(__dirname, "../view", "success.html"));
      //   // res.render("success", { code: vnp_Params["vnp_ResponseCode"] });
      // } else {
      //   res.redirect(
      //     `https://thegioifitness.com/payment/fail/index?amount=${vnp_Params['vnp_Amount']}&&vnp_TxnRef=${vnp_Params['vnp_TxnRef']}&&vnp_TransactionNo=${vnp_Params['vnp_TransactionNo']}&&vnp_ResponseCode=${vnp_Params['vnp_ResponseCode']}&&vnp_PayDate=${vnp_Params['vnp_PayDate']}`,
      //   );
      //   // res.sendFile(path.join(__dirname, "../view", "fail.html"));
      //   // res.render("success", { code: "97" });
      // }
    } catch (error) {
      throw new HttpException('Something wrong`', 500);
    }
  }

  sortObject(obj) {
    const sorted = {};
    const str = [];
    let key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key));
      }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
      sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
    }
    return sorted;
  }
  removeAccents(str) {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
  }

  async paymentOrder(createVnpayDto: CreatePaymentDto) {
    // const token = await this.jwtService.signAsync(
    //   {
    //     iss: process.env.appotaPartnerCode,
    //     jti: process.env.appotaApiKey + '-' + new Date().getTime(),
    //     api_key: process.env.appotaApiKey,
    //   },
    //   {
    //     expiresIn: '10m',
    //     header: {
    //       alg: 'HS256',
    //       typ: 'JWT',
    //       cty: 'appotapay-api;v=1',
    //     },
    //     secret: process.env.appotaSecretKey,
    //   },
    // );
    // const order = await this.orderTable.create({
    //   order: createVnpayDto.orderId,
    //   money: createVnpayDto.amount,
    //   status: PaymentStatus.CREATE,
    // });
    // await this.orderTable.save(order);
    // const dataSignature = `amount=${createVnpayDto.amount}&bankCode=&clientIp=${process.env.ip}&extraData=${createVnpayDto.orderId}&notifyUrl=${process.env.appotaIPNOrderUrl}&orderId=${order.id}&orderInfo=${createVnpayDto.orderId}&paymentMethod=&redirectUrl=${process.env.appotaReturnUrl}`;
    // const hmac = CryptoJS.enc.Hex.stringify(
    //   CryptoJS.HmacSHA256(dataSignature, process.env.appotaSecretKey),
    // );
    // const requestConfig: AxiosRequestConfig = {
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'X-APPOTAPAY-AUTH': `Bearer ${token}`,
    //   },
    // };
    // try {
    //   const body = {
    //     amount: createVnpayDto.amount,
    //     orderId: order.id,
    //     orderInfo: `${createVnpayDto.orderId}`,
    //     bankCode: '',
    //     paymentMethod: '',
    //     clientIp: process.env.ip,
    //     extraData: createVnpayDto.orderId,
    //     notifyUrl: process.env.appotaIPNOrderUrl,
    //     redirectUrl: process.env.appotaReturnUrl,
    //     signature: hmac,
    //   };
    //   const data = await lastValueFrom(
    //     this.httpService.post(
    //       this.configService.get('appotaUrl') + '/api/v1/orders/payment/bank',
    //       body,
    //       requestConfig,
    //     ),
    //   );
    //   return data.data;
    // } catch (error) {
    //   throw new HttpException(error.response.data, error.response.status);
    // }
  }

  async returnIPNOrder(req: ReturnIPNDto) {
    // console.log(req);
    // const dataSignature = `amount=${req.amount}&apiKey=${req.apiKey}&appotapayTransId=${req.appotapayTransId}&bankCode=${req.bankCode}&currency=${req.currency}&errorCode=${req.errorCode}&extraData=${req.extraData}&message=${req.message}&orderId=${req.orderId}&partnerCode=${req.partnerCode}&paymentMethod=${req.paymentMethod}&paymentType=${req.paymentType}&transactionTs=${req.transactionTs}`;
    // const hmac = CryptoJS.enc.Hex.stringify(
    //   CryptoJS.HmacSHA256(dataSignature, process.env.appotaSecretKey),
    // );
    // if (hmac === req.signature) {
    //   if (req.errorCode === 0) {
    //     const order = await this.orderTable.findOne(req.orderId);
    //     if (order.status == '0') {
    //       const connection = getConnection();
    //       const queryRunner = connection.createQueryRunner();
    //       await queryRunner.connect();
    //       await queryRunner.startTransaction();
    //       try {
    //         const updateOrder = await this.orderTable.update(order.id, {
    //           status: '1',
    //           transactionTs: req.transactionTs,
    //           appotapayTransId: req.appotapayTransId,
    //           errrorCode: req.errorCode,
    //           extraData: req.extraData,
    //           //message:req.message
    //         });
    //         const updateMonney = await this.orderTableResponse.update(
    //           { id: order.order },
    //           {
    //             status: OrderStatus.PayMent_Success,
    //           },
    //         );
    //         await queryRunner.manager.save(updateOrder);
    //         await queryRunner.manager.save(updateMonney);
    //         await queryRunner.commitTransaction();
    //         return { status: 'ok' };
    //       } catch (error) {
    //         console.log(error);
    //         await queryRunner.rollbackTransaction();
    //       } finally {
    //         await queryRunner.release();
    //       }
    //     } else {
    //       throw new BadRequestException(500, `Da duoc update`);
    //     }
    //   }
    //   throw new BadRequestException(500, `Thanh toan that bai`);
    // } else {
    //   throw new BadRequestException(500, `Sai Chu Ky`);
    // }
  }

  async createPaymentVnpayUrl(req, createVnpayDto, user) {
    const ipAddr =
      req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;
    const tmnCode = process.env.vnp_TmnCode;
    const secretKey = process.env.vnp_HashSecret;
    let vnpUrl = process.env.vnp_Url;
    const returnUrl = process.env.vnp_ReturnUrl;

    const amount = req.body.amount.toString();
    const bankCode = req.body.bankCode;
    const orderInfo = req.body.orderDescription;
    const orderType = req.body.orderType;
    let locale = req.body.language;
    const createDate = this.getFormat();
    const customerInfo = await this.customerRepository.findOne({
      where: {
        id: user.relativeId,
      },
    });
    const historyVnPay = this.vnpayTable.create({
      money: amount.toString(),
      status: PaymentStatus.CREATE,
      user: customerInfo,
    });
    await this.vnpayTable.save(historyVnPay);
    if (locale == null || locale == '') {
      locale = 'vn';
    }
    const currCode = 'VND';
    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    // vnp_Params['vnp_Merchant'] = '';
    vnp_Params['vnp_Locale'] = locale;
    vnp_Params['vnp_CurrCode'] = currCode;
    vnp_Params['vnp_TxnRef'] = historyVnPay.id;
    vnp_Params['vnp_OrderInfo'] = orderInfo;
    vnp_Params['vnp_OrderType'] = orderType;
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;
    if (bankCode != null && bankCode !== '') {
      vnp_Params['vnp_BankCode'] = bankCode;
    }
    vnp_Params = this.sortObject(vnp_Params);
    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(new Buffer(signData, 'utf-8')).digest('hex');
    vnp_Params['vnp_SecureHash'] = signed;
    vnpUrl += '?' + qs.stringify(vnp_Params, { encode: false });

    return { url: vnpUrl };
  }

  async returnVnpayUrl(req, res) {
    let vnp_Params = req.query;

    const secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = this.sortObject(vnp_Params);

    const tmnCode = process.env.vnp_TmnCode;
    const secretKey = process.env.vnp_HashSecret;

    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(new Buffer(signData, 'utf-8')).digest('hex');

    if (secureHash === signed) {
      //Kiem tra xem du lieu trong db co hop le hay khong va thong bao ket qua

      res.render('success', { code: vnp_Params['vnp_ResponseCode'] });
    } else {
      res.render('success', { code: '97' });
    }
  }

  async returnIpn(req) {
    let vnp_Params = req.query;
    const secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = this.sortObject(vnp_Params);
    const secretKey = process.env.vnp_HashSecret;
    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(new Buffer(signData, 'utf-8')).digest('hex');

    if (secureHash === signed) {
      const orderId = vnp_Params['vnp_TxnRef'];
      await this.vnpayTable.update(orderId, {
        status: PaymentStatus.SUCCESS,
      });
      console.log(orderId);
      const order = await this.vnpayTable.findOne({
        where: { id: orderId },
        relations: ['user'],
      });
      console.log(order);

      if (vnp_Params['vnp_ResponseCode'] == '00') {
        await this.vnpayTable.update(
          { id: orderId },
          { status: PaymentStatus.SUCCESS },
        );
        const money = new BigNumber(order.user.money)
          .plus(new BigNumber(order.money))
          .toString();
        await this.customerRepository.update(order.user.id, { money });
        console.log(money);
        //Kiem tra du lieu co hop le khong, cap nhat trang thai don hang va gui ket qua cho VNPAY theo dinh dang duoi
        return { RspCode: '00', Message: 'success' };
      } else {
        await this.vnpayTable.update(
          { id: orderId },
          { status: PaymentStatus.FAIL },
        );

        //Kiem tra du lieu co hop le khong, cap nhat trang thai don hang va gui ket qua cho VNPAY theo dinh dang duoi
        return { RspCode: '00', Message: 'success' };
      }
    } else {
      return { RspCode: '97', Message: 'Fail checksum' };
    }
  }

  getFormat() {
    const d_t = new Date(new Date().getTime() + 7 * 60 * 60 * 1000);
    const year = d_t.getFullYear();
    const month = ('0' + (d_t.getMonth() + 1)).slice(-2);
    const day = ('0' + d_t.getDate()).slice(-2);
    const hour = ('0' + d_t.getHours()).slice(-2);
    const minute = ('0' + d_t.getMinutes()).slice(-2);
    const seconds = ('0' + d_t.getSeconds()).slice(-2);
    return `${year}${month}${day}${hour}${minute}${seconds}`;
  }
}
