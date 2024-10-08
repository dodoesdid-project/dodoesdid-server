import { Module } from '@nestjs/common';
import { NestjsFormDataModule } from 'nestjs-form-data';

import { JwtStrategy } from '@/modules/auth/strategies/jwt.strategy';
import { AwsService } from '@/modules/aws/aws.service';
import { GroupController } from '@/modules/group/group.controller';
import { GroupService } from '@/modules/group/group.service';
import { UserService } from '@/modules/user/user.service';

@Module({
  imports: [NestjsFormDataModule],
  controllers: [GroupController],
  providers: [GroupService, JwtStrategy, AwsService, UserService],
})
export class GroupModule {}
