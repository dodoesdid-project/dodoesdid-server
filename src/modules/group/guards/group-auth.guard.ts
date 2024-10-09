import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { abstractAuthGuard } from '@/common/guards/abstract-auth.guard';

import { GroupService } from '@/modules/group/group.service';

@Injectable()
export class GroupAuthGuard extends abstractAuthGuard {
  protected readonly reflector: Reflector;
  constructor(protected readonly groupService: GroupService) {
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

    await this.validateUserInGroup({
      groupId: request.params.id,
      userId: user.id,
    });

    return true;
  }
}
