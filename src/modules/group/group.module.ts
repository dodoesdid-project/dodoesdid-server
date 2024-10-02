import { Module } from '@nestjs/common';

import { JwtStrategy } from '@/modules/auth/strategies/jwt.strategy';

import { GroupController } from './group.controller';
import { GroupService } from './group.service';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { AwsService } from '../aws/aws.service';
import { UserService } from '../user/user.service';

@Module({
  imports: [NestjsFormDataModule],
  controllers: [GroupController],
  providers: [GroupService, JwtStrategy, AwsService, UserService],
})
export class GroupModule {}
