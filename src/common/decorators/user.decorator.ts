import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Provider } from '@prisma/client';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  birth: string;
  socials: Provider[] | null;
  profile: {
    nickName: string;
    thumbnail: string | null;
  } | null;
}
