import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@/modules/prisma/prisma.service';

import { formatDateTime } from '@/utils/common';

@Injectable()
export class CommentService {
  constructor(private readonly prismaService: PrismaService) {}

  async getCommentByDazimId({
    userId,
    dazimId,
  }: {
    userId: string;
    dazimId: string;
  }) {
    const dazimComments = await this.prismaService.dazimComment.findMany({
      where: {
        dazimId,
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
    return dazimComments.map((dazimComment) => ({
      id: dazimComment.id,
      content: dazimComment.content,
      createAt: formatDateTime(dazimComment.createAt),
      updateAt: formatDateTime(dazimComment.updateAt),
      user: {
        id: dazimComment.user.id,
        isMe: dazimComment.user.id === userId,
        profile: {
          nickName: dazimComment.user.userProfile.nickName,
          thumbnail: dazimComment.user.userProfile.thumbnail,
        },
      },
      replies: dazimComment.replies.map((reply) => ({
        id: reply.id,
        parentId: reply.parentId,
        content: reply.content,
        createAt: formatDateTime(reply.createAt),
        updateAt: formatDateTime(reply.updateAt),
        user: {
          id: reply.user.id,
          isMe: reply.user.id === userId,
          profile: {
            nickName: reply.user.userProfile.nickName,
            thumbnail: reply.user.userProfile.thumbnail,
          },
        },
      })),
    }));
  }

  async createComment({
    userId,
    dazimId,
    content,
  }: {
    userId: string;
    dazimId: string;
    content: string;
  }) {
    const dazim = await this.prismaService.dazim.findUnique({
      where: {
        id: dazimId,
      },
    });

    if (!dazim) {
      throw new NotFoundException('dazim not found');
    }

    await this.prismaService.dazimComment.create({
      data: {
        userId,
        dazimId: dazimId,
        content,
      },
    });
  }

  async replyComment({
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

  async checkIsUserWrittenComment({
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

    return comment.userId === userId;
  }

  async updateComment({
    userId,
    commentId,
    content,
  }: {
    userId: string;
    commentId: string;
    content: string;
  }) {
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

  async deleteComment({
    userId,
    commentId,
  }: {
    userId: string;
    commentId: string;
  }) {
    await this.prismaService.dazimComment.delete({
      where: {
        id: commentId,
        userId,
      },
    });
  }
}
