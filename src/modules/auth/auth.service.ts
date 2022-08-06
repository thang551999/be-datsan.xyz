import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { RegisterUserDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ChangePasswordUserDto } from './dto/change-password.dto';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { ConfirmRegisterdDto } from './dto/confirm-register.dto copy';
import { OTPDto } from './dto/otp.dto';
import { ConfirmForgotPasswordOTPDto } from './dto/forgot-password-otp.dto';
import { AUTH_MESSAGE, ROLE } from 'src/common/constant';
import { UpdateUserDto } from './dto/update-user.dto';
import { API_SUCCESS } from '../../common/constant';
import { Customer } from '../users/entities/customer.entity';
import { OwnerPlace } from '../owner-place/entities/owner-place.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(OwnerPlace)
    private ownerRepository: Repository<OwnerPlace>,

    @InjectRepository(UserEntity)
    private adminRepository: Repository<UserEntity>,

    private readonly jwtService: JwtService,
    private readonly mailerService: MailService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}
  private HASH_ROUND_NUMBER = 5;
  async register(registerUserDto: RegisterUserDto) {
    const userCheck = await this.usersRepository.findOne({
      where: {
        email: registerUserDto.email,
      },
    });
    if (userCheck) {
      if (userCheck.actived) {
        throw new HttpException(
          AUTH_MESSAGE.EMAIL_EXITS,
          HttpStatus.BAD_REQUEST,
        );
      }
      if (userCheck.actived === false) {
        const token = await this.jwtService.signAsync(
          {
            id: userCheck.id,
          },
          { expiresIn: '5m' },
        );
        await this.mailerService.sendUserConfirmation(
          token,
          userCheck?.fullName,
          registerUserDto.email,
        );
        return {
          message: 'Check email pls',
        };
      }
    }
    if (registerUserDto.role === ROLE.admin) {
      return {
        message: 'Cannot register admin role',
      };
    }
    const passwordHash = await bcrypt.hashSync(
      registerUserDto.password.trim(),
      this.HASH_ROUND_NUMBER,
    );
    const user = await this.usersRepository.create({
      email: registerUserDto.email,
      password: passwordHash,
      role: registerUserDto.role,
      phone: registerUserDto.phone,
      fullName: registerUserDto.fullName,
    });
    user.password = passwordHash;
    await this.usersRepository.save(user);
    if (registerUserDto.role === ROLE.user) {
      const customer = await this.customerRepository.create();
      await this.customerRepository.save(customer);
      await this.usersRepository.update(user.id, {
        customer,
      });
      const token = await this.jwtService.signAsync(
        {
          id: user.id,
          role: user.role,
          userType: user.userType,
        },
        { expiresIn: '5m' },
      );
      await this.mailerService.sendUserConfirmation(
        token,
        userCheck?.fullName,
        registerUserDto.email,
      );
    }
    if (registerUserDto.role === ROLE.owner) {
      const ownerPlace = await this.ownerRepository.create({
        address: registerUserDto.ownerPlace.bankSymbol,
        phone: registerUserDto.ownerPlace.bankSymbol,
        stk: registerUserDto.ownerPlace.bankSymbol,
        bankSymbol: registerUserDto.ownerPlace.bankSymbol,
      });
      await this.ownerRepository.save(ownerPlace);
      await this.usersRepository.update(user.id, {
        ownerPlace,
      });
      const token = await this.jwtService.signAsync(
        {
          id: user.id,
          role: user.role,
          userType: user.userType,
        },
        { expiresIn: '5m' },
      );
      await this.mailerService.sendUserConfirmation(
        token,
        userCheck?.fullName,
        registerUserDto.email,
      );
    }

    return {
      message: 'Đăng Ký Thành Công',
    };
  }
  async login(loginUserDto: LoginUserDto) {
    const user = await this.usersRepository.findOne({
      where: {
        email: loginUserDto.email,
      },
      relations: ['ownerPlace', 'admin', 'customer'],
    });
    if (!user) {
      throw new HttpException(
        AUTH_MESSAGE.EMAIL_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    if (!bcrypt.compareSync(loginUserDto.password.trim(), user.password)) {
      throw new HttpException(
        AUTH_MESSAGE.WRONG_PASSWORD,
        HttpStatus.BAD_REQUEST,
      );
    }
    if (user.actived == false) {
      if (user.role === ROLE.user) {
        const token = await this.jwtService.signAsync(
          {
            id: user.id,
            role: user.role,
            userType: user.userType,
            relativeId: user.customer.id,
          },
          { expiresIn: '5m' },
        );
        // await this.mailerService.sendUserConfirmation(
        //   token,
        //   user.fullName,
        //   user.email,
        // );
        throw new HttpException(
          AUTH_MESSAGE.CHECK_MAIL_ACTIVE,
          HttpStatus.UNAUTHORIZED,
        );
      }
      throw new HttpException(
        AUTH_MESSAGE.EMAIL_NOT_ACTIVE,
        HttpStatus.BAD_REQUEST,
      );
    }
    let relativeId = '';
    if (user.role === ROLE.user) {
      relativeId = user.customer.id;
    }
    if (user.role === ROLE.owner) {
      if (user.approved === false) {
        throw new HttpException(
          AUTH_MESSAGE.OWNER_NOT_APPROVE,
          HttpStatus.BAD_REQUEST,
        );
      }
      relativeId = user.ownerPlace?.id;
    }
    if (user.role === ROLE.admin) {
      relativeId = user.admin.id;
    }
    const token = await this.jwtService.signAsync(
      {
        id: user.id,
        role: user.role,
        userType: user.userType,
        relativeId,
      },
      { expiresIn: '1d' },
    );
    const refreshToken = await this.jwtService.signAsync(
      {
        id: user.id,
        role: user.role,
        userType: user.userType,
      },
      { expiresIn: '365d' },
    );
    return {
      code: API_SUCCESS,
      token,
      refreshToken,
      role: user.role,
      id: user.id,
      fullName: user.fullName,
      avatar: user.avatar,
      phone: user.phone,
    };
  }
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersRepository.findOne({
      where: {
        phone: forgotPasswordDto.phone,
      },
    });
    if (!user) {
      throw new HttpException(AUTH_MESSAGE.EMAIL_EXITS, HttpStatus.BAD_REQUEST);
    }
    const confirm = await this.confirmForgotPassword({
      code: forgotPasswordDto.code,
      phone: forgotPasswordDto.phone,
    });
    if (confirm.status) {
      const passwordHash = await bcrypt.hashSync(
        forgotPasswordDto.password.trim(),
        this.HASH_ROUND_NUMBER,
      );
      await this.usersRepository.update(
        { phone: forgotPasswordDto.phone },
        { password: passwordHash },
      );
      return { message: 'Thành công .' };
    }
    throw new BadRequestException('OTP Het Han');
  }
  async getUser(id: string) {
    const user = await this.usersRepository.findOne({
      where: {
        id,
      },
      relations: ['customer'],
    });

    if (!user) {
      throw new HttpException(AUTH_MESSAGE.EMAIL_EXITS, HttpStatus.NOT_FOUND);
    }
    return user;
  }
  async updateInfo(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.findOne({
      where: {
        id,
      },
    });
    if (!user) {
      throw new HttpException(AUTH_MESSAGE.EMAIL_EXITS, HttpStatus.NOT_FOUND);
    }
    await this.usersRepository.update({ id }, { ...updateUserDto });
    return { message: 'Cập nhật thành công.' };
  }
  async changePassword(
    id: string,
    changePasswordUserDto: ChangePasswordUserDto,
  ) {
    const user = await this.usersRepository.findOne({
      where: {
        id,
      },
    });
    if (!user) {
      throw new HttpException(AUTH_MESSAGE.EMAIL_EXITS, HttpStatus.NOT_FOUND);
    }
    if (
      !bcrypt.compareSync(changePasswordUserDto.password.trim(), user.password)
    ) {
      throw new HttpException(AUTH_MESSAGE.EMAIL_EXITS, HttpStatus.BAD_REQUEST);
    }
    const passwordHash = bcrypt.hashSync(
      changePasswordUserDto.newPassword.trim(),
      this.HASH_ROUND_NUMBER,
    );
    user.password = passwordHash;
    await this.usersRepository.save(user);
    return { message: 'Đổi Mật Khẩu Thành Công' };
  }

  async confirmForgotPassword(
    confirmForgotPasswordDto: ConfirmForgotPasswordOTPDto,
  ) {
    return {
      message: 'Thành công  .',
      status: 1,
      confirmForgotPasswordDto,
    };
  }

  async refreshToken(token: string) {
    const data: any = await this.jwtService.decode(token);
    const newToken = await this.jwtService.signAsync(
      {
        id: data.id,
        role: data.role,
        userType: data.userType,
      },
      { expiresIn: '365d' },
    );
    return {
      token: newToken,
    };
  }
  async active(id: string) {
    await this.usersRepository.update({ id }, { actived: true });
  }
  async sendSms(OTPDto: OTPDto) {
    return OTPDto;
  }
  async confirmRegister(confirmDto: ConfirmRegisterdDto) {
    return confirmDto;
  }

  async activeEmail(params) {
    const payload = await this.jwtService.verify(params.token);
    const user = await this.usersRepository.findOne({
      where: { id: payload.id },
    });
    if (user) {
      if (user.role === ROLE.user) {
        await this.usersRepository.update(
          { id: user.id },
          {
            actived: true,
          },
        );
      }
    }
  }

  async GetOwnerPlace(params) {
    const ownerPlaces = await this.usersRepository.findAndCount({
      where: { role: ROLE.owner },
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
      relations: ['ownerPlace'],
    });
    return {
      total: ownerPlaces[1],
      pageSize: params.pageSize,
      currentPage: params.page,
      records: ownerPlaces[0],
    };
  }

  async approveOwnerPlace(id) {
    await this.usersRepository.update({ id: id }, { approved: true });
    return { message: 'Phê duyệt chủ sân thành công' };
  }
  async disableOwnerPlace(id) {
    await this.usersRepository.update({ id: id }, { approved: false });
    return { message: 'Chặn chủ sân thành công' };
  }
}
