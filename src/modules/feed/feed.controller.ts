import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Res,
  UseGuards,
} from '@nestjs/common';

import { User } from '@/common/decorators/user.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt.guards';

import { FeedService } from './feed.service';

import { Response } from 'express';
import { ToggleReactionFeedDto } from './dto/toggle-reaction-feed.dto';
import { CreateFeedCommentDto } from './dto/create-feed-comment.dto';

@Controller()
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @UseGuards(JwtAuthGuard)
  @Get('feeds')
  async getFeeds(@User() user: User, @Res() res: Response) {
    const feeds = await this.feedService.getFeeds({
      userId: user.id,
    });

    res.status(HttpStatus.OK).send(feeds);
  }

  @UseGuards(JwtAuthGuard)
  @Get('feed/:feedId')
  async getFeed(
    @User() user: User,
    @Param() { feedId }: { feedId: string },
    @Res() res: Response,
  ) {
    const feed = await this.feedService.getFeed({ userId: user.id, feedId });

    res.status(HttpStatus.OK).send(feed);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/feed/:feedId/reaction-toggle')
  async ToggleReactionFeed(
    @User() user: User,
    @Param() { feedId }: { feedId: string },
    @Body() { reactionType }: ToggleReactionFeedDto,
    @Res() res: Response,
  ) {
    const { count, isMeReactionType } =
      await this.feedService.toggleReactionFeed({
        userId: user.id,
        feedId,
        reactionType,
      });

    res.status(HttpStatus.OK).send({ reactionType, count, isMeReactionType });
  }

  @UseGuards(JwtAuthGuard)
  @Get('/feed/:feedId/comment')
  async getFeedComments(
    @User() user: User,
    @Param() { feedId }: { feedId: string },
    @Res() res: Response,
  ) {
    const feedComments = await this.feedService.getFeedComments({
      userId: user.id,
      feedId,
    });

    res.status(HttpStatus.OK).send(feedComments);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/feed/:feedId/comment')
  async createFeedComment(
    @User() user: User,
    @Param() { feedId }: { feedId: string },
    @Body() { content }: CreateFeedCommentDto,
    @Res() res: Response,
  ) {
    const count = await this.feedService.createFeedComment({
      userId: user.id,
      feedId,
      content,
    });

    res.status(HttpStatus.CREATED).send({
      message: 'Create feed comment successfully',
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('/comment/:commentId/reply')
  async replyFeedComment(
    @User() user: User,
    @Param() { commentId }: { commentId: string },
    @Body() { content }: CreateFeedCommentDto,
    @Res() res: Response,
  ) {
    await this.feedService.replyFeedComment({
      userId: user.id,
      commentId,
      content,
    });

    res.status(HttpStatus.CREATED).send({
      message: 'Create feed comment reply successfully',
    });
  }

  @UseGuards(JwtAuthGuard)
  @Put('/comment/:commentId')
  async updateFeedComment(
    @User() user: User,
    @Param() { commentId }: { commentId: string },
    @Body() { content }: CreateFeedCommentDto,
    @Res() res: Response,
  ) {
    const updatedFeedComment = await this.feedService.updateFeedComment({
      userId: user.id,
      commentId,
      content,
    });

    res.status(HttpStatus.NO_CONTENT).send();
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/comment/:commentId')
  async deleteFeedComment(
    @User() user: User,
    @Param() { commentId }: { commentId: string },
    @Res() res: Response,
  ) {
    await this.feedService.deleteFeedComment({
      userId: user.id,
      commentId,
    });

    res.status(HttpStatus.NO_CONTENT).send();
  }
}
