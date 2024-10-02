import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
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

  @Get('/group/:id')
  async getGroup(
    @Param() { id }: { id: string },
    @User() user: User,
    @Res() res: Response,
  ) {
    const group = await this.groupService.getGroupById(id);

    res.status(HttpStatus.OK).send(group);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/groups')
  async getGroups(@User() user: User, @Res() res: Response) {
    const groups = await this.groupService.getGroupsByUserId(user.id);

    res.status(HttpStatus.OK).send(groups);
  }
}
