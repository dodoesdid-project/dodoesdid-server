import { Module } from '@nestjs/common';
import { NestjsFormDataModule } from 'nestjs-form-data';

import { JwtStrategy } from '@/modules/auth/strategies/jwt.strategy';
import { AwsService } from '@/modules/aws/aws.service';
import { UserController } from '@/modules/user/user.controller';
import { UserService } from '@/modules/user/user.service';

@Module({
  imports: [NestjsFormDataModule],
  controllers: [UserController],
  providers: [UserService, JwtStrategy, AwsService],
})
export class UserModule {}
