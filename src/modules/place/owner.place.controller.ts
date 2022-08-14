import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Delete,
  Param,
  Put,
  Query,
} from '@nestjs/common';
import { PlaceService } from './place.service';
import {
  CreatePlaceDto,
  CreateServiceDto,
  DayOffDto,
  DisableTimeDto,
  TimeGold,
} from './dto/create-place.dto';
import { OwnerAuthGuard } from '../auth/jwt.strategy';
import { API_SUCCESS, PLACE_MESSAGE } from '../../common/constant';
import { IUserInfo, UserInfo } from '../../common/decorators/user.decorator';
import {
  UpdatePlaceDto,
  UpdateService,
  UpdateTimeGold,
} from './dto/update-place.dto';
import { GetParams } from '../payment/dto/create-vnpay.dto';
import { GetPlaceOwner } from './dto/get-place.dto';

@UseGuards(OwnerAuthGuard)
@Controller('owner/place')
export class OwnerPlaceController {
  constructor(private readonly placeService: PlaceService) {}

  @Post()
  async create(
    @Body() createPlaceDto: CreatePlaceDto,
    @UserInfo() user: IUserInfo,
  ) {
    const place = await this.placeService.create(createPlaceDto, user);
    return {
      code: API_SUCCESS,
      message: PLACE_MESSAGE.CREATE_PLACE_SUCCESS,
      data: place,
    };
  }

  @Post('service')
  async createService(
    @Body() createServiceDto: CreateServiceDto,
    @UserInfo() user: IUserInfo,
  ) {
    const place = await this.placeService.createService(createServiceDto, user);
    return {
      code: API_SUCCESS,
      message: PLACE_MESSAGE.CREATE_SERVICE_SUCCESS,
      data: place,
    };
  }

  @Post('time-gold')
  async createTimeGold(
    @Body() timeGoldDto: TimeGold,
    @UserInfo() user: IUserInfo,
  ) {
    const place = await this.placeService.createTimeGold(timeGoldDto, user);
    return {
      code: API_SUCCESS,
      message: PLACE_MESSAGE.CREATE_SERVICE_SUCCESS,
      data: place,
    };
  }
  @Post('day-off')
  async creatDayOff(@Body() dayOff: DayOffDto, @UserInfo() user: IUserInfo) {
    const place = await this.placeService.createDayOff(dayOff, user);
    return {
      code: API_SUCCESS,
      message: PLACE_MESSAGE.CREATE_SERVICE_SUCCESS,
      data: place,
    };
  }

  @Post('disable-time')
  async disableTime(
    @Body() disableTime: DisableTimeDto,
    @UserInfo() user: IUserInfo,
  ) {
    const place = await this.placeService.disableTimeBlock(disableTime, user);
    return {
      code: API_SUCCESS,
      message: PLACE_MESSAGE.CREATE_SERVICE_SUCCESS,
      data: place,
    };
  }
  @Get('type-place')
  async getTypePlace() {
    const place = await this.placeService.getTypePlaceAdmin();
    return {
      code: API_SUCCESS,
      message: PLACE_MESSAGE.CREATE_PLACE_SUCCESS,
      data: place,
    };
  }

  @Get()
  async getPlace(
    @Query() getParams: GetPlaceOwner,
    @UserInfo() user: IUserInfo,
  ) {
    const place = await this.placeService.getPlaceOwner(getParams, user);
    return {
      code: API_SUCCESS,
      data: place,
    };
  }

  @Put('time-gold/:id')
  updateTimeGold(
    @Param('id') id: string,
    @Body() updatePlaceDto: UpdateTimeGold,
    @UserInfo() user: IUserInfo,
  ) {
    return this.placeService.updateTimeGold(id, updatePlaceDto, user);
  }

  @Put('service/:id')
  updateService(
    @Param('id') id: string,
    @Body() updatePlaceDto: UpdateService,
    @UserInfo() user: IUserInfo,
  ) {
    return this.placeService.updateService(id, updatePlaceDto, user);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updatePlaceDto: UpdatePlaceDto) {
    return this.placeService.update(id, updatePlaceDto);
  }

  @Delete('service/:id')
  @UseGuards(OwnerAuthGuard)
  async removeService(@Param('id') id: string, @UserInfo() user: IUserInfo) {
    await this.placeService.removeServicePlace(id, user);
    return {
      code: API_SUCCESS,
      message: PLACE_MESSAGE.DISABLE_SUCCESS,
    };
  }

  @Delete('time-gold/:id')
  @UseGuards(OwnerAuthGuard)
  async removeTimeGold(@Param('id') id: string, @UserInfo() user: IUserInfo) {
    await this.placeService.removeTimeGold(id, user);
    return {
      code: API_SUCCESS,
      message: PLACE_MESSAGE.DISABLE_SUCCESS,
    };
  }

  @Delete(':id')
  @UseGuards(OwnerAuthGuard)
  async remove(@Param('id') id: string, @UserInfo() user: IUserInfo) {
    await this.placeService.remove(id, user);
    return {
      code: API_SUCCESS,
      message: PLACE_MESSAGE.DISABLE_SUCCESS,
    };
  }
}
