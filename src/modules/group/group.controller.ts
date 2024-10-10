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
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { FormDataRequest, MemoryStoredFile } from 'nestjs-form-data';

import { User } from '@/common/decorators/user.decorator';
import { IdParamDto } from '@/common/dto/id-param.dto';

import { JwtAuthGuard } from '@/modules/auth/guards/jwt.guard';
import { DazimService } from '@/modules/dazim/dazim.service';
import { CreateGroupDto } from '@/modules/group/dto/create-group.dto';
import { CreateGroupDazimDto } from '@/modules/group/dto/create-group-dazim.dto';
import { EnterGroupDto } from '@/modules/group/dto/enter-group.dto';
import { GetGroupUsersQueryDto } from '@/modules/group/dto/get-group-users-query.dto';
import { GetGroupsDazimSuccessDatesQueryDto } from '@/modules/group/dto/get-groups-success-dazim-query.dto';
import { UpdateGroupNameDto } from '@/modules/group/dto/update-group-name.dto';
import { UpdateGroupNoticeDto } from '@/modules/group/dto/update-group-notice.dto';
import { UpdateGroupThumbnailDto } from '@/modules/group/dto/update-group-thumbnail.dto';
import { UpdateGroupsOrderDto } from '@/modules/group/dto/update-groups-order.dto';
import { GroupService } from '@/modules/group/group.service';
import { GroupAuthGuard } from '@/modules/group/guards/group-auth.guard';
import { UserService } from '@/modules/user/user.service';

@Controller('groups')
export class GroupController {
  constructor(
    private readonly groupService: GroupService,
    private readonly dazimService: DazimService,
    private readonly userService: UserService,
  ) {}
  @UseGuards(JwtAuthGuard)
  @FormDataRequest({ storage: MemoryStoredFile })
  @Post()
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
  @Post('/enter')
  async EnterGroup(
    @User() user: User,
    @Body() { inviteCode }: EnterGroupDto,
    @Res() res: Response,
  ) {
    await this.groupService.enterGroup({ userId: user.id, inviteCode });

    res.status(HttpStatus.NO_CONTENT).send();
  }

  @UseGuards(JwtAuthGuard)
  @Get('/dazim-success-dates')
  async getGroupsDazimSuccessDates(
    @User() user: User,
    @Query()
    {
      dazimStartDate,
      dazimEndDate,
      dazimSuccessType,
    }: GetGroupsDazimSuccessDatesQueryDto,
    @Res() res: Response,
  ) {
    const groups = await this.groupService.getGroupsDazimSuccessDates({
      userId: user.id,
      dazimStartDate,
      dazimEndDate,
      dazimSuccessType,
    });

    res.status(HttpStatus.OK).send(groups);
  }

  @UseGuards(JwtAuthGuard, GroupAuthGuard)
  @Get('/:id')
  async getGroup(@Param() { id }: IdParamDto, @Res() res: Response) {
    const group = await this.groupService.getGroupById(id);

    res.status(HttpStatus.OK).send(group);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getGroups(@User() user: User, @Res() res: Response) {
    const groups = await this.groupService.getGroupsByUserId(user.id);

    res.status(HttpStatus.OK).send(groups);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/order')
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

  @UseGuards(JwtAuthGuard, GroupAuthGuard)
  @Patch('/:id/name')
  async updateGroupName(
    @Param() { id }: IdParamDto,
    @Body() { name }: UpdateGroupNameDto,
    @Res() res: Response,
  ) {
    await this.groupService.updateGroupName({
      id,
      name,
    });

    res.status(HttpStatus.NO_CONTENT).send();
  }

  @UseGuards(JwtAuthGuard, GroupAuthGuard)
  @FormDataRequest({ storage: MemoryStoredFile })
  @Patch('/:id/thumbnail')
  async updateGroupThumbnail(
    @Param() { id }: IdParamDto,
    @Body() { thumbnail }: UpdateGroupThumbnailDto,
    @Res() res: Response,
  ) {
    await this.groupService.updateGroupThumbnail({
      id,
      thumbnail,
    });

    res.status(HttpStatus.NO_CONTENT).send();
  }

  @UseGuards(JwtAuthGuard, GroupAuthGuard)
  @Patch('/:id/notice')
  async updateGroup(
    @Param() { id }: IdParamDto,
    @Body() { notice }: UpdateGroupNoticeDto,
    @Res() res: Response,
  ) {
    await this.groupService.updateGroupNotice({
      id,
      notice,
    });

    res.status(HttpStatus.NO_CONTENT).send();
  }

  @UseGuards(JwtAuthGuard, GroupAuthGuard)
  @Delete('/:id/leave')
  async leaveGroup(
    @User() user: User,
    @Param() { id }: IdParamDto,
    @Res() res: Response,
  ) {
    await this.groupService.leaveGroup({
      userId: user.id,
      groupId: id,
    });

    res.status(HttpStatus.NO_CONTENT).send();
  }

  @UseGuards(JwtAuthGuard, GroupAuthGuard)
  @Get('/:id/users')
  async getGroupUsers(
    @User() user: User,
    @Param() { id }: IdParamDto,
    @Query() { dazimCreateDate }: GetGroupUsersQueryDto,
    @Res() res: Response,
  ) {
    const users = await this.userService.getUsersByGroupId({
      userId: user.id,
      groupId: id,
      dazimCreateDate,
    });

    res.status(HttpStatus.OK).send(users);
  }

  @UseGuards(JwtAuthGuard, GroupAuthGuard)
  @Post('/:id/dazim')
  async createGroupDazim(
    @User() user: User,
    @Param() { id }: IdParamDto,
    @Body() { content }: CreateGroupDazimDto,
    @Res() res: Response,
  ) {
    await this.dazimService.createGroupDazim({
      userId: user.id,
      groupId: id,
      content,
    });

    res
      .status(HttpStatus.CREATED)
      .send({ message: 'Create Dazim Successfully' });
  }
}
