import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReactionType } from '@prisma/client';
import * as dayjs from 'dayjs';
import { MemoryStoredFile } from 'nestjs-form-data';
import { v4 as uuid } from 'uuid';

import { AwsService } from '@/modules/aws/aws.service';
import { PrismaService } from '@/modules/prisma/prisma.service';

import { formatDateTime, getTimeAgo } from '@/utils/common';

@Injectable()
export class DazimService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly awsService: AwsService,
  ) {}

  async getDazims({
    userId,
    isSuccess,
  }: {
    userId: string;
    isSuccess?: boolean;
  }) {
    const dazims = await this.prismaService.dazim.findMany({
      where: {
        group: {
          groupsOnUsers: {
            some: {
              userId,
            },
          },
        },
        isSuccess,
      },
      select: {
        id: true,
        groupId: true,
        content: true,
        photo: true,
        isSuccess: true,
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

    return dazims.map((dazim) => ({
      id: dazim.id,
      groupId: dazim.groupId,
      content: dazim.content,
      photo: dazim.photo,
      isSuccess: dazim.isSuccess,
      createAt: formatDateTime(dazim.createAt),
      updateAt: formatDateTime(dazim.updateAt),
      timeAge: getTimeAgo(dazim.updateAt),
      user: {
        id: dazim.user.id,
        profile: dazim.user.userProfile && {
          nickName: dazim.user.userProfile.nickName,
          thumbnail: dazim.user.userProfile.thumbnail,
        },
      },
      commentCount: dazim._count.dazimComments,
      reactionCount: dazim._count.dazimReactions,
    }));
  }

  async getDazim({ userId, dazimId }: { userId: string; dazimId: string }) {
    const dazim = await this.prismaService.dazim.findUnique({
      where: {
        id: dazimId,
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

    if (!dazim) {
      throw new NotFoundException('Dazim not found');
    }

    const dazimReactionGroupBy = await this.prismaService.dazimReaction.groupBy(
      {
        by: ['reactionType'],
        where: {
          dazimId: dazimId,
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
        dazimId: dazimId,
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
      id: dazim.id,
      groupId: dazim.groupId,
      content: dazim.content,
      photo: dazim.photo,
      createAt: formatDateTime(dazim.createAt),
      updateAt: formatDateTime(dazim.updateAt),
      timeAge: getTimeAgo(dazim.updateAt),
      user: {
        id: dazim.id,
        profile: dazim.user.userProfile && {
          nickName: dazim.user.userProfile.nickName,
          thumbnail: dazim.user.userProfile.thumbnail,
        },
      },
      ...reactionCounts,
      ...isMeReactions,
    };
  }

  async createDazim({
    userId,
    groupId,
    content,
  }: {
    userId: string;
    groupId: string;
    content: string;
  }) {
    // check if dazim created today
    const dazim = await this.prismaService.dazim.findFirst({
      where: {
        userId,
        groupId,
        createAt: {
          gte: dayjs().startOf('day').toDate(),
          lt: dayjs().endOf('day').toDate(),
        },
      },
    });

    if (dazim) {
      throw new ConflictException('Already Created Dazim today');
    }

    await this.prismaService.dazim.create({
      data: {
        userId,
        groupId,
        content,
      },
    });
  }

  async toggleReactionDazim({
    userId,
    dazimId,
    reactionType,
  }: {
    userId: string;
    dazimId: string;
    reactionType: ReactionType;
  }): Promise<{
    count: number;
    isMeReactionType: boolean;
  }> {
    const dazimReaction = await this.prismaService.dazimReaction.findUnique({
      where: {
        dazimId_reactionType_userId: {
          userId,
          dazimId: dazimId,
          reactionType,
        },
      },
    });

    if (!dazimReaction) {
      await this.prismaService.dazimReaction.create({
        data: {
          userId,
          reactionType,
          dazimId: dazimId,
        },
      });
    } else {
      await this.prismaService.dazimReaction.delete({
        where: {
          dazimId_reactionType_userId: {
            userId,
            reactionType,
            dazimId: dazimId,
          },
        },
      });
    }

    const count = await this.prismaService.dazimReaction.count({
      where: {
        reactionType,
        dazimId: dazimId,
      },
    });

    return {
      count,
      isMeReactionType: !!!dazimReaction,
    };
  }

  async checkIsUserWrittenDazim({ userId, dazimId }): Promise<boolean> {
    const dazim = await this.prismaService.dazim.findUnique({
      where: {
        id: dazimId,
      },
    });

    if (!dazim) {
      throw new NotFoundException('Dazim not found');
    }

    return userId === dazim.userId;
  }

  async completeDazim({
    userId,
    dazimId,
    photo,
  }: {
    userId: string;
    dazimId: string;
    photo: MemoryStoredFile;
  }) {
    const uploadedPhoto = await this.awsService.imageUploadToS3({
      buffer: photo.buffer,
      fileName: `user/${userId}/dazim/${uuid()}`,
      ext: photo.extension,
    });

    await this.prismaService.dazim.update({
      where: {
        userId,
        id: dazimId,
      },
      data: {
        photo: uploadedPhoto,
        isSuccess: true,
      },
    });
  }
}
