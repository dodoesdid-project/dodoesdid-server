import { ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { abstractAuthGuard } from '@/common/guards/abstract-auth.guard';

import { DazimService } from '@/modules/dazim/dazim.service';
import { GroupService } from '@/modules/group/group.service';

@Injectable()
export class DazimAuthGuard extends abstractAuthGuard {
  protected readonly reflector: Reflector;
  constructor(
    protected readonly groupService: GroupService,
    protected readonly dazimService: DazimService,
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

    const isDazimWriter = await this.dazimService.checkIsUserWrittenDazim({
      userId: user.id,
      dazimId: request.params.id,
    });

    if (!isDazimWriter) {
      throw new ForbiddenException('Not a Dazim writer');
    }

    return true;
  }
}
