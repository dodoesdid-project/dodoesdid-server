import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { FormDataRequest, MemoryStoredFile } from 'nestjs-form-data';

import { User } from '@/common/decorators/user.decorator';
import { IdParamDto } from '@/common/dto/id-param.dto';

import { JwtAuthGuard } from '@/modules/auth/guards/jwt.guard';
import { CommentService } from '@/modules/comment/comment.service';
import { DazimService } from '@/modules/dazim/dazim.service';
import { CompleteDazimDto } from '@/modules/dazim/dto/complete-dazim.dto';
import { CreateDazimCommentDto } from '@/modules/dazim/dto/create-dazim-comment.dto';
import { GetDazimsQueryDto } from '@/modules/dazim/dto/get-dazims-query.dto';
import { ToggleDazimReactionDto } from '@/modules/dazim/dto/toggle-dazim-reaction.dto';
import { DazimAuthGuard } from '@/modules/dazim/guards/dazim-auth.guard';
import { GroupAuthGuard } from '@/modules/dazim/guards/group-auth.guard';

@Controller('dazims')
export class DazimController {
  constructor(
    private readonly dazimService: DazimService,
    private readonly commentService: CommentService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getDazims(
    @User() user: User,
    @Query() { isSuccess }: GetDazimsQueryDto,
    @Res() res: Response,
  ) {
    const dazims = await this.dazimService.getDazims({
      userId: user.id,
      isSuccess,
    });

    res.status(HttpStatus.OK).send(dazims);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getDazim(
    @User() user: User,
    @Param() { id }: IdParamDto,
    @Res() res: Response,
  ) {
    const dazim = await this.dazimService.getDazim({
      userId: user.id,
      dazimId: id,
    });

    res.status(HttpStatus.OK).send(dazim);
  }

  @UseGuards(JwtAuthGuard, DazimAuthGuard)
  @FormDataRequest({ storage: MemoryStoredFile })
  @Post('/:id/complete')
  async completeDazim(
    @User() user: User,
    @Param() { id }: IdParamDto,
    @Body() { photo }: CompleteDazimDto,
    @Res() res: Response,
  ) {
    await this.dazimService.completeDazim({
      userId: user.id,
      dazimId: id,
      photo,
    });

    res.status(HttpStatus.NO_CONTENT).send();
  }

  @UseGuards(JwtAuthGuard, GroupAuthGuard)
  @Post('/:id/reaction-toggle')
  async ToggleReactionDazim(
    @User() user: User,
    @Param() { id }: IdParamDto,
    @Body() { reactionType }: ToggleDazimReactionDto,
    @Res() res: Response,
  ) {
    const { count, isMeReactionType } =
      await this.dazimService.toggleReactionDazim({
        userId: user.id,
        dazimId: id,
        reactionType,
      });

    res.status(HttpStatus.OK).send({ reactionType, count, isMeReactionType });
  }

  @UseGuards(JwtAuthGuard, GroupAuthGuard)
  @Get('/:id/comment')
  async getDazimComments(
    @User() user: User,
    @Param() { id }: IdParamDto,
    @Res() res: Response,
  ) {
    const dazimComments = await this.commentService.getCommentByDazimId({
      userId: user.id,
      dazimId: id,
    });

    res.status(HttpStatus.OK).send(dazimComments);
  }

  @UseGuards(JwtAuthGuard, GroupAuthGuard)
  @Post('/:id/comment')
  async createDazimComment(
    @User() user: User,
    @Param() { id }: IdParamDto,
    @Body() { content }: CreateDazimCommentDto,
    @Res() res: Response,
  ) {
    await this.commentService.createComment({
      userId: user.id,
      dazimId: id,
      content,
    });

    res.status(HttpStatus.CREATED).send({
      message: 'Create dazim comment successfully',
    });
  }
}
