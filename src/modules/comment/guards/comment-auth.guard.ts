import { ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { abstractAuthGuard } from '@/common/guards/abstract-auth.guard';

import { CommentService } from '@/modules/comment/comment.service';
import { GroupService } from '@/modules/group/group.service';

@Injectable()
export class CommentAuthGuard extends abstractAuthGuard {
  protected readonly reflector: Reflector;
  constructor(
    protected readonly groupService: GroupService,
    protected readonly commentService: CommentService,
  ) {
    super(groupService);
  }

  protected async authorize({
    request,
    user,
  }: {
    request: any;
    user: any;
    ctx: any;
  }): Promise<boolean> {
    await this.validateIdParam(request.params);

    const isCommentWriter = await this.commentService.checkIsUserWrittenComment(
      {
        userId: user.id,
        commentId: request.params.id,
      },
    );

    if (!isCommentWriter) {
      throw new ForbiddenException('Not a Comment writer');
    }

    return true;
  }
}
