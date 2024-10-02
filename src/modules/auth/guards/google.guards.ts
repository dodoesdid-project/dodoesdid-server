import { ExecutionContext } from '@nestjs/common';
import { AuthGuard, IAuthModuleOptions } from '@nestjs/passport';

export class GoogleAuthGuard extends AuthGuard('google') {
  getAuthenticateOptions(context: ExecutionContext): IAuthModuleOptions<any> {
    const request = context.switchToHttp().getRequest();
    return {
      state: request.query.redirectUrl || '/',
    };
  }
}
