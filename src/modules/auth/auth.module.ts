import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { MailModule } from '../mail/mail.module';
import { MailService } from '../mail/mail.service';
import { Customer } from '../users/entities/customer.entity';
import { Admin } from '../admin/entities/admin.entity';
import { OwnerPlace } from '../owner-place/entities/owner-place.entity';
@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
    TypeOrmModule.forFeature([UserEntity, Customer, Admin, OwnerPlace]),
    PassportModule,
    HttpModule,
    MailModule,
    MailService,
  ],
  providers: [AuthService, ConfigService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService, PassportModule],
})
export class AuthModule {}
