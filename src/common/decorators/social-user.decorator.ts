import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const SocialUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

export interface SocialUser {
  id: string;
  name: string;
  email: string;
  thumbnail: string;
  accessToken: string;
  refreshToken: string;
}
