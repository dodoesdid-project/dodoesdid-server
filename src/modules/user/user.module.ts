import { Module } from '@nestjs/common';

import { JwtStrategy } from '@/modules/auth/strategies/jwt.strategy';

import { UserController } from './user.controller';
import { UserService } from './user.service';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { AwsService } from '../aws/aws.service';

@Module({
  imports: [NestjsFormDataModule],
  controllers: [UserController],
  providers: [UserService, JwtStrategy, AwsService],
})
export class UserModule {}
