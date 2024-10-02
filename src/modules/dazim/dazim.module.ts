import { Module } from '@nestjs/common';

import { JwtStrategy } from '@/modules/auth/strategies/jwt.strategy';

import { DazimController } from './dazim.controller';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { AwsService } from '../aws/aws.service';
import { DazimService } from './dazim.service';
import { UserService } from '../user/user.service';
import { GroupService } from '../group/group.service';

@Module({
  imports: [NestjsFormDataModule],
  controllers: [DazimController],
  providers: [DazimService, JwtStrategy, AwsService, UserService, GroupService],
})
export class DazimModule {}
