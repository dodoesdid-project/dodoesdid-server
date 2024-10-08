import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ReactionType } from '@prisma/client';

import { PrismaService } from '@/modules/prisma/prisma.service';

import { formatDateTime, getTimeAgo } from '@/utils/common';

@Injectable()
export class FeedService {
  constructor(private prismaService: PrismaService) {}

  async getFeeds({ userId }: { userId: string }) {
    const feeds = await this.prismaService.dazim.findMany({
      where: {
        group: {
          groupsOnUsers: {
            some: {
              userId,
            },
          },
        },
        isSuccess: true,
      },
      select: {
        id: true,
        groupId: true,
        content: true,
        photo: true,
        createAt: true,
        updateAt: true,
        user: {
          select: {
            id: true,
            userProfile: {
              select: {
                nickName: true,
                thumbnail: true,
              },
            },
          },
        },
        _count: {
          select: {
            dazimComments: true,
            dazimReactions: true,
          },
        },
      },
    });

    return feeds.map((feed) => ({
      id: feed.id,
      groupId: feed.groupId,
      content: feed.content,
      photo: feed.photo,
      createAt: formatDateTime(feed.createAt),
      updateAt: formatDateTime(feed.updateAt),
      timeAge: getTimeAgo(feed.updateAt),
      user: {
        id: feed.user.id,
        profile: feed.user.userProfile && {
          nickName: feed.user.userProfile.nickName,
          thumbnail: feed.user.userProfile.thumbnail,
        },
      },
      commentCount: feed._count.dazimComments,
      reactionCount: feed._count.dazimReactions,
    }));
  }

  async getFeed({ userId, feedId }: { userId: string; feedId: string }) {
    const feed = await this.prismaService.dazim.findUnique({
      where: {
        id: feedId,
        group: {
          dazims: {
            some: {
              userId,
            },
          },
        },
      },
      select: {
        id: true,
        groupId: true,
        content: true,
        photo: true,
        createAt: true,
        updateAt: true,
        user: {
          select: {
            id: true,
            userProfile: {
              select: {
                nickName: true,
                thumbnail: true,
              },
            },
          },
        },
        dazimComments: true,
      },
    });

    if (!feed) {
      throw new NotFoundException('Feed not found');
    }

    const dazimReactionGroupBy = await this.prismaService.dazimReaction.groupBy(
      {
        by: ['reactionType'],
        where: {
          dazimId: feedId,
        },
        _count: {
          reactionType: true,
        },
      },
    );

    const reactionCounts = dazimReactionGroupBy.reduce(
      (acc, { reactionType, _count }) => {
        acc[`${reactionType.toLowerCase()}Count`] = _count.reactionType;
        return acc;
      },
      {
        fireCount: 0,
        starCount: 0,
        congratulationsCount: 0,
        heartCount: 0,
        musicCount: 0,
      },
    );

    const dazimReactions = await this.prismaService.dazimReaction.findMany({
      where: {
        dazimId: feedId,
        userId,
      },
    });

    const isMeReactions = dazimReactions.reduce(
      (acc, { reactionType }) => {
        acc[
          `isMeReaction${reactionType.charAt(0)}${reactionType.slice(1).toLowerCase()}`
        ] = true;
        return acc;
      },
      {
        isMeReactionFire: false,
        isMeReactionStar: false,
        isMeReactionCongratulations: false,
        isMeReactionHeart: false,
        isMeReactionMusic: false,
      },
    );

    return {
      id: feed.id,
      groupId: feed.groupId,
      content: feed.content,
      photo: feed.photo,
      createAt: formatDateTime(feed.createAt),
      updateAt: formatDateTime(feed.updateAt),
      timeAge: getTimeAgo(feed.updateAt),
      user: {
        id: feed.id,
        profile: feed.user.userProfile && {
          nickName: feed.user.userProfile.nickName,
          thumbnail: feed.user.userProfile.thumbnail,
        },
      },
      ...reactionCounts,
      ...isMeReactions,
    };
  }

  async toggleReactionFeed({
    userId,
    feedId,
    reactionType,
  }: {
    userId: string;
    feedId: string;
    reactionType: ReactionType;
  }): Promise<{
    count: number;
    isMeReactionType: boolean;
  }> {
    const dazimReaction = await this.prismaService.dazimReaction.findUnique({
      where: {
        dazimId_reactionType_userId: {
          userId,
          dazimId: feedId,
          reactionType,
        },
      },
    });

    if (!dazimReaction) {
      await this.prismaService.dazimReaction.create({
        data: {
          userId,
          reactionType,
          dazimId: feedId,
        },
      });
    } else {
      await this.prismaService.dazimReaction.delete({
        where: {
          dazimId_reactionType_userId: {
            userId,
            reactionType,
            dazimId: feedId,
          },
        },
      });
    }

    const count = await this.prismaService.dazimReaction.count({
      where: {
        reactionType,
        dazimId: feedId,
      },
    });

    return {
      count,
      isMeReactionType: !!!dazimReaction,
    };
  }

  async getFeedComments({
    userId,
    feedId,
  }: {
    userId: string;
    feedId: string;
  }) {
    const feedComments = await this.prismaService.dazimComment.findMany({
      where: {
        dazimId: feedId,
        parentId: null,
      },
      orderBy: {
        createAt: 'asc',
      },
      select: {
        id: true,
        content: true,
        createAt: true,
        updateAt: true,
        user: {
          select: {
            id: true,
            userProfile: {
              select: {
                nickName: true,
                thumbnail: true,
              },
            },
          },
        },
        replies: {
          select: {
            id: true,
            parentId: true,
            content: true,
            createAt: true,
            updateAt: true,
            user: {
              select: {
                id: true,
                userProfile: {
                  select: {
                    nickName: true,
                    thumbnail: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    return feedComments.map((feedComment) => ({
      id: feedComment.id,
      content: feedComment.content,
      createAt: formatDateTime(feedComment.createAt),
      updateAt: formatDateTime(feedComment.updateAt),
      user: {
        id: feedComment.user.id,
        profile: {
          nickName: feedComment.user.userProfile.nickName,
          thumbnail: feedComment.user.userProfile.thumbnail,
        },
      },
      replies: feedComment.replies.map((reply) => ({
        id: reply.id,
        parentId: reply.parentId,
        content: reply.content,
        createAt: formatDateTime(reply.createAt),
        updateAt: formatDateTime(reply.updateAt),
        user: {
          id: reply.user.id,
          profile: {
            nickName: reply.user.userProfile.nickName,
            thumbnail: reply.user.userProfile.thumbnail,
          },
        },
      })),
    }));
  }

  async createFeedComment({
    userId,
    feedId,
    content,
  }: {
    userId: string;
    feedId: string;
    content: string;
  }) {
    const feed = await this.prismaService.dazim.findUnique({
      where: {
        id: feedId,
      },
    });

    if (!feed) {
      throw new NotFoundException('feed not found');
    }

    await this.prismaService.dazimComment.create({
      data: {
        userId,
        dazimId: feedId,
        content,
      },
    });
  }

  async replyFeedComment({
    userId,
    commentId,
    content,
  }: {
    userId: string;
    commentId: string;
    content: string;
  }) {
    const comment = await this.prismaService.dazimComment.findUnique({
      where: {
        id: commentId,
      },
    });

    if (!comment) {
      throw new NotFoundException('comment not found');
    }

    await this.prismaService.dazimComment.create({
      data: {
        userId,
        dazimId: comment.dazimId,
        parentId: commentId,
        content,
      },
    });
  }

  async checkFeedCommentAuthorization({
    commentId,
    userId,
  }: {
    commentId: string;
    userId: string;
  }) {
    const comment = await this.prismaService.dazimComment.findUnique({
      where: {
        id: commentId,
      },
    });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    if (comment.userId !== userId) {
      throw new UnauthorizedException();
    }
  }

  async updateFeedComment({
    userId,
    commentId,
    content,
  }: {
    userId: string;
    commentId: string;
    content: string;
  }) {
    await this.checkFeedCommentAuthorization({ userId, commentId });

    await this.prismaService.dazimComment.update({
      where: {
        id: commentId,
        userId,
      },
      data: {
        content,
      },
    });
  }

  async deleteFeedComment({
    userId,
    commentId,
  }: {
    userId: string;
    commentId: string;
  }) {
    await this.checkFeedCommentAuthorization({ userId, commentId });

    await this.prismaService.dazimComment.delete({
      where: {
        id: commentId,
        userId,
      },
    });
  }
}
