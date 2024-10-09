import { Module } from '@nestjs/common';
import { NestjsFormDataModule } from 'nestjs-form-data';

import { AwsService } from '@/modules/aws/aws.service';
import { DazimService } from '@/modules/dazim/dazim.service';
import { GroupController } from '@/modules/group/group.controller';
import { GroupService } from '@/modules/group/group.service';
import { UserService } from '@/modules/user/user.service';

@Module({
  imports: [NestjsFormDataModule],
  controllers: [GroupController],
  providers: [AwsService, GroupService, UserService, DazimService],
})
export class GroupModule {}
