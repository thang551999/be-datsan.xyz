import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface IUserInfo {
  id: string;
  role: string;
  userType: string;
  relativeId: string;
}
export const UserInfo = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
