import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as dayjs from 'dayjs';
import { MemoryStoredFile } from 'nestjs-form-data';
import * as shortId from 'shortid';
import { v4 as uuid } from 'uuid';

import { AwsService } from '@/modules/aws/aws.service';
import { DazimSuccessType } from '@/modules/group/dto/get-groups-success-dazim-query.dto';
import { PrismaService } from '@/modules/prisma/prisma.service';

import { formatDate, formatDateTime } from '@/utils/common';

@Injectable()
export class GroupService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly awsService: AwsService,
  ) {}

  async checkIsUserInGroup({
    userId,
    groupId,
  }: {
    userId: string;
    groupId: string;
  }) {
    const group = await this.prismaService.group.findUnique({
      where: {
        id: groupId,
      },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const groupsOnUsers = await this.prismaService.groupsOnUsers.findUnique({
      where: {
        userId_groupId: {
          groupId,
          userId,
        },
      },
    });

    return !!groupsOnUsers;
  }

  async createGroup({
    userId,
    name,
    thumbnail,
  }: {
    userId: string;
    name: string;
    thumbnail: MemoryStoredFile;
  }): Promise<string> {
    const inviteCode = shortId.generate();

    const uploadedThumbnail = await this.awsService.imageUploadToS3({
      buffer: thumbnail.buffer,
      fileName: `group/thumbnail/${uuid()}`,
      ext: thumbnail.extension,
    });

    const maxOrderGroup = await this.prismaService.groupsOnUsers.findFirst({
      where: { userId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const group = await this.prismaService.group.create({
      data: {
        name,
        thumbnail: uploadedThumbnail,
        inviteCode,
        groupsOnUsers: {
          create: {
            userId,
            order: maxOrderGroup ? ++maxOrderGroup.order : 0,
          },
        },
      },
    });

    return group.id;
  }

  async enterGroup({
    userId,
    inviteCode,
  }: {
    userId: string;
    inviteCode: string;
  }) {
    const group = await this.prismaService.group.findUnique({
      where: {
        inviteCode,
      },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const groupOnUsers = await this.prismaService.groupsOnUsers.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId: group.id,
        },
      },
    });

    if (groupOnUsers) {
      throw new ConflictException('Already entered user');
    }

    await this.prismaService.groupsOnUsers.create({
      data: {
        userId,
        groupId: group.id,
      },
    });
  }

  async getGroupById(id: string) {
    const group = await this.prismaService.group.findUnique({
      where: {
        id,
      },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    return {
      id: group.id,
      name: group.name,
      thumbnail: group.thumbnail,
      inviteCode: group.inviteCode,
      notice: group.notice,
      createAt: formatDateTime(group.createAt),
      updateAt: formatDateTime(group.updateAt),
    };
  }

  async getGroupByDazimId(id: string) {
    const dazim = await this.prismaService.dazim.findUnique({
      where: {
        id,
      },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            thumbnail: true,
            inviteCode: true,
            notice: true,
            createAt: true,
            updateAt: true,
          },
        },
      },
    });

    if (!dazim) {
      throw new NotFoundException('Dazim not Found');
    }

    return {
      id: dazim.group.id,
      name: dazim.group.name,
      thumbnail: dazim.group.thumbnail,
      inviteCode: dazim.group.inviteCode,
      notice: dazim.group.notice,
      createAt: formatDateTime(dazim.group.createAt),
      updateAt: formatDateTime(dazim.group.updateAt),
    };
  }

  async getGroupsByUserId(userId: string) {
    const groupOnUsers = await this.prismaService.groupsOnUsers.findMany({
      where: {
        userId,
      },
      select: {
        group: true,
      },
      orderBy: {
        order: 'asc',
      },
    });

    return groupOnUsers.map((groupOnUser) => ({
      id: groupOnUser.group.id,
      name: groupOnUser.group.name,
      thumbnail: groupOnUser.group.thumbnail,
      inviteCode: groupOnUser.group.inviteCode,
      notice: groupOnUser.group.notice,
      createAt: formatDateTime(groupOnUser.group.createAt),
      updateAt: formatDateTime(groupOnUser.group.updateAt),
    }));
  }

  async getGroupsDazimSuccessDates({
    userId,
    dazimStartDate,
    dazimEndDate,
    dazimSuccessType,
  }: {
    userId: string;
    dazimStartDate: string;
    dazimEndDate: string;
    dazimSuccessType: DazimSuccessType;
  }) {
    const groupsOnUsers = await this.prismaService.groupsOnUsers.findMany({
      where: {
        userId,
      },
      orderBy: {
        order: 'asc',
      },
      select: {
        group: {
          select: {
            id: true,
            name: true,
            _count: {
              select: {
                groupsOnUsers: true,
              },
            },
            dazims: {
              select: {
                createAt: true,
              },
              where: {
                createAt: {
                  gte: dayjs(dazimStartDate).toDate(),
                  lte: dayjs(dazimEndDate).toDate(),
                },
                userId: dazimSuccessType === 'PERSONAL' ? userId : undefined,
                isSuccess: true,
              },
              orderBy: {
                createAt: 'asc',
              },
            },
          },
        },
      },
    });

    if (dazimSuccessType === 'PERSONAL') {
      return groupsOnUsers.map((groupsOnUser) => ({
        id: groupsOnUser.group.id,
        name: groupsOnUser.group.name,
        userCount: groupsOnUser.group._count.groupsOnUsers,
        dazimSuccessDates: groupsOnUser.group.dazims.map((dazim) =>
          formatDate(dazim.createAt),
        ),
      }));
    } else if (dazimSuccessType === 'GROUP') {
      return groupsOnUsers.map((groupsOnUser) => {
        const { group } = groupsOnUser;
        const dazimSuccessDateCountMap = group.dazims
          .map((dazim) => formatDate(dazim.createAt))
          .reduce((acc, date) => {
            acc[date] = acc[date] ? ++acc[date] : 1;
            return acc;
          }, {});

        const dazimSuccessDates = Object.keys(dazimSuccessDateCountMap).filter(
          (date) =>
            dazimSuccessDateCountMap[date] >= group._count.groupsOnUsers,
        );

        return {
          id: group.id,
          name: group.name,
          userCount: group._count.groupsOnUsers,
          dazimSuccessDates,
        };
      });
    }
  }

  async updateGroupsOrder({
    userId,
    groupIds,
  }: {
    userId: string;
    groupIds: string[];
  }) {
    const groupsOnUsers = await this.prismaService.groupsOnUsers.findMany({
      where: {
        userId,
      },
      select: {
        groupId: true,
      },
    });

    const userGroupIds = groupsOnUsers.map((userGroup) => userGroup.groupId);

    if (
      userGroupIds.length !== groupIds.length ||
      !groupIds.every((id) => userGroupIds.includes(id))
    ) {
      throw new NotFoundException('Not found groups or count mismatch');
    }

    await Promise.all(
      groupIds.map((groupId, index) => {
        return this.prismaService.groupsOnUsers.update({
          where: {
            userId_groupId: {
              groupId,
              userId,
            },
          },
          data: { order: index },
        });
      }),
    );
  }

  async updateGroupName({ id, name }: { id: string; name: string }) {
    await this.prismaService.group.update({
      data: {
        name,
      },
      where: {
        id,
      },
    });
  }

  async updateGroupThumbnail({
    id,
    thumbnail,
  }: {
    id: string;
    thumbnail: MemoryStoredFile;
  }) {
    const uploadedThumbnail = await this.awsService.imageUploadToS3({
      buffer: thumbnail.buffer,
      fileName: `group/thumbnail/${uuid()}`,
      ext: thumbnail.extension,
    });

    await this.prismaService.group.update({
      data: {
        thumbnail: uploadedThumbnail,
      },
      where: {
        id,
      },
    });
  }

  async updateGroupNotice({ id, notice }: { id: string; notice: string }) {
    await this.prismaService.group.update({
      data: {
        notice,
      },
      where: {
        id,
      },
    });
  }

  async leaveGroup({ userId, groupId }: { userId: string; groupId: string }) {
    await this.prismaService.groupsOnUsers.delete({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
    });

    const groupOnUserCount = await this.prismaService.groupsOnUsers.count({
      where: {
        groupId,
      },
    });

    if (groupOnUserCount === 0) {
      await this.prismaService.group.delete({
        where: {
          id: groupId,
        },
      });
    }
  }
}
