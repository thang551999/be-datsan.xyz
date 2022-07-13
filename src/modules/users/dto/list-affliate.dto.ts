import { ApiProperty, PickType } from '@nestjs/swagger';
import { UserEntity } from 'src/modules/users/entities/user.entity';
export class UserBaseAffilate extends PickType(UserEntity, [
  'id',
  'fullName',
]) {}
export class GetListAffildateDto {
  @ApiProperty({ type: UserBaseAffilate })
  user: UserBaseAffilate;

  @ApiProperty({ type: [UserBaseAffilate] })
  listUserSecond: UserBaseAffilate[];

  @ApiProperty({ type: [UserBaseAffilate] })
  listUserThird: UserBaseAffilate[];
}
