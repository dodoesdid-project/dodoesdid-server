import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

import { IdParamDto } from '@/common/dto/id-param.dto';

import { GroupService } from '@/modules/group/group.service';

export abstract class abstractAuthGuard implements CanActivate {
  protected abstract readonly reflector: Reflector;
  constructor(protected readonly groupService: GroupService) {}

  protected async validateIdParam(idParam: { id: string }) {
    const idParamDto = plainToClass(IdParamDto, idParam);
    const errors = await validate(idParamDto);
    if (errors.length > 0) {
      throw new BadRequestException(
        errors.flatMap((error) => Object.values(error.constraints)),
      );
    }
  }

  protected async validateUserInGroup({ userId, groupId }) {
    const isUserInGroup = await this.groupService.checkIsUserInGroup({
      userId,
      groupId,
    });

    if (!isUserInGroup) {
      throw new ForbiddenException('Not a group member');
    }
  }

  async canActivate(ctx: ExecutionContext) {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return this.authorize({ request, user, ctx });
  }

  protected abstract authorize({ request, user, ctx }): Promise<boolean>;
}
