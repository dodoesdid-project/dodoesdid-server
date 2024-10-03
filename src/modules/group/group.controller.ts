import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Res,
  UseGuards,
} from '@nestjs/common';

import { User } from '@/common/decorators/user.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt.guards';

import { GroupService } from './group.service';

import { Response } from 'express';
import { FormDataRequest, MemoryStoredFile } from 'nestjs-form-data';
import { CreateGroupDto } from './dto/create-group.dto';
import { EnterGroupDto } from './dto/enter-group.dto';
import { UpdateGroupsOrderDto } from './dto/update-groups-order.dto';
import { UpdateGroupNameDto } from './dto/update-group-name.dto';
import { UpdateGroupThumbnailDto } from './dto/update-group-thumbnail.dto';
import { UpdateGroupNoticeDto } from './dto/update-group-notice.dto';

@Controller()
export class GroupController {
  constructor(private readonly groupService: GroupService) {}
  @UseGuards(JwtAuthGuard)
  @FormDataRequest({ storage: MemoryStoredFile })
  @Post('group')
  async createGroup(
    @User() user: User,
    @Body() { name, thumbnail }: CreateGroupDto,
    @Res() res: Response,
  ) {
    const id = await this.groupService.createGroup({
      userId: user.id,
      name,
      thumbnail,
    });

    res.status(HttpStatus.CREATED).send({
      id,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('group/enter')
  async EnterGroup(
    @User() user: User,
    @Body() { inviteCode }: EnterGroupDto,
    @Res() res: Response,
  ) {
    await this.groupService.enterGroup({ userId: user.id, inviteCode });

    res.status(HttpStatus.NO_CONTENT).send();
  }

  @UseGuards(JwtAuthGuard)
  @Get('/group/:groupId')
  async getGroup(
    @Param() { groupId }: { groupId: string },
    @User() user: User,
    @Res() res: Response,
  ) {
    const group = await this.groupService.getGroup({
      userId: user.id,
      groupId,
    });

    res.status(HttpStatus.OK).send(group);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/groups')
  async getGroups(@User() user: User, @Res() res: Response) {
    const groups = await this.groupService.getGroupsByUserId(user.id);

    res.status(HttpStatus.OK).send(groups);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/groups/order')
  async updateGroupsOrder(
    @User() user: User,
    @Body() { ids }: UpdateGroupsOrderDto,
    @Res() res: Response,
  ) {
    const groups = await this.groupService.updateGroupsOrder({
      userId: user.id,
      groupIds: ids,
    });

    res.status(HttpStatus.OK).send(groups);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/group/:groupId/name')
  async updateGroupName(
    @User() user: User,
    @Param() { groupId }: { groupId: string },
    @Body() { name }: UpdateGroupNameDto,
    @Res() res: Response,
  ) {
    await this.groupService.updateGroupName({
      userId: user.id,
      groupId,
      name,
    });

    res.status(HttpStatus.NO_CONTENT).send();
  }

  @UseGuards(JwtAuthGuard)
  @FormDataRequest({ storage: MemoryStoredFile })
  @Patch('/group/:groupId/thumbnail')
  async updateGroupThumbnail(
    @User() user: User,
    @Param() { groupId }: { groupId: string },
    @Body() { thumbnail }: UpdateGroupThumbnailDto,
    @Res() res: Response,
  ) {
    await this.groupService.updateGroupThumbnail({
      userId: user.id,
      groupId,
      thumbnail,
    });

    res.status(HttpStatus.NO_CONTENT).send();
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/group/:groupId/notice')
  async updateGroup(
    @User() user: User,
    @Param() { groupId }: { groupId: string },
    @Body() { notice }: UpdateGroupNoticeDto,
    @Res() res: Response,
  ) {
    await this.groupService.updateGroupNotice({
      userId: user.id,
      groupId,
      notice,
    });

    res.status(HttpStatus.NO_CONTENT).send();
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/group/:groupId/leave')
  async leaveGroup(
    @User() user: User,
    @Param() { groupId }: { groupId: string },
    @Res() res: Response,
  ) {
    await this.groupService.leaveGroup({
      userId: user.id,
      groupId,
    });

    res.status(HttpStatus.NO_CONTENT).send();
  }
}
