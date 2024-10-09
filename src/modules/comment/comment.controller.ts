import {
  Body,
  Controller,
  Delete,
  HttpStatus,
  Param,
  Post,
  Put,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';

import { User } from '@/common/decorators/user.decorator';
import { IdParamDto } from '@/common/dto/id-param.dto';

import { JwtAuthGuard } from '@/modules/auth/guards/jwt.guard';
import { CommentService } from '@/modules/comment/comment.service';
import { replyCommentDto } from '@/modules/comment/dto/reply-comment.dto';
import { updateCommentDto } from '@/modules/comment/dto/update-comment.dto';
import { CommentAuthGuard } from '@/modules/comment/guards/comment-auth.guard';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/:commentId/reply')
  async replyComment(
    @User() user: User,
    @Param() { id }: IdParamDto,
    @Body() { content }: replyCommentDto,
    @Res() res: Response,
  ) {
    await this.commentService.replyComment({
      userId: user.id,
      commentId: id,
      content,
    });

    res.status(HttpStatus.CREATED).send({
      message: 'Create comment comment reply successfully',
    });
  }

  @UseGuards(JwtAuthGuard, CommentAuthGuard)
  @Put('/:id')
  async updateComment(
    @User() user: User,
    @Param() { id }: IdParamDto,
    @Body() { content }: updateCommentDto,
    @Res() res: Response,
  ) {
    await this.commentService.updateComment({
      userId: user.id,
      commentId: id,
      content,
    });

    res.status(HttpStatus.NO_CONTENT).send();
  }

  @UseGuards(JwtAuthGuard, CommentAuthGuard)
  @Delete('/:id')
  async deleteComment(
    @User() user: User,
    @Param() { id }: IdParamDto,
    @Res() res: Response,
  ) {
    await this.commentService.deleteComment({
      userId: user.id,
      commentId: id,
    });

    res.status(HttpStatus.NO_CONTENT).send();
  }
}
