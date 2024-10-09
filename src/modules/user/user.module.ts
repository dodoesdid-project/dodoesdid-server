import { Module } from '@nestjs/common';
import { NestjsFormDataModule } from 'nestjs-form-data';

import { AwsService } from '@/modules/aws/aws.service';
import { UserController } from '@/modules/user/user.controller';
import { UserService } from '@/modules/user/user.service';

@Module({
  imports: [NestjsFormDataModule],
  controllers: [UserController],
  providers: [UserService, AwsService],
})
export class UserModule {}
