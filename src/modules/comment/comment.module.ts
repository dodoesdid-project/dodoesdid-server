import { Module } from '@nestjs/common';

import { AwsService } from '@/modules/aws/aws.service';
import { CommentController } from '@/modules/comment/comment.controller';
import { CommentService } from '@/modules/comment/comment.service';
import { GroupService } from '@/modules/group/group.service';

@Module({
  imports: [],
  controllers: [CommentController],
  providers: [AwsService, CommentService, GroupService],
})
export class CommentModule {}
