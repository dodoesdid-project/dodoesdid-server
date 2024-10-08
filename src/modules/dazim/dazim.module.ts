import { Module } from '@nestjs/common';
import { NestjsFormDataModule } from 'nestjs-form-data';

import { JwtStrategy } from '@/modules/auth/strategies/jwt.strategy';
import { AwsService } from '@/modules/aws/aws.service';
import { DazimController } from '@/modules/dazim/dazim.controller';
import { DazimService } from '@/modules/dazim/dazim.service';
import { GroupService } from '@/modules/group/group.service';
import { UserService } from '@/modules/user/user.service';

@Module({
  imports: [NestjsFormDataModule],
  controllers: [DazimController],
  providers: [DazimService, JwtStrategy, AwsService, UserService, GroupService],
})
export class DazimModule {}
