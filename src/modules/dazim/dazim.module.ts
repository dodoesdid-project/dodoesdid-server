import { Module } from '@nestjs/common';
import { NestjsFormDataModule } from 'nestjs-form-data';

import { AwsService } from '@/modules/aws/aws.service';
import { CommentService } from '@/modules/comment/comment.service';
import { DazimController } from '@/modules/dazim/dazim.controller';
import { DazimService } from '@/modules/dazim/dazim.service';
import { GroupService } from '@/modules/group/group.service';

@Module({
  imports: [NestjsFormDataModule],
  controllers: [DazimController],
  providers: [AwsService, DazimService, GroupService, CommentService],
})
export class DazimModule {}
