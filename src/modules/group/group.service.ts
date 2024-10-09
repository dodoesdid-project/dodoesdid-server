import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MemoryStoredFile } from 'nestjs-form-data';
import { v4 as uuid } from 'uuid';

import { AwsService } from '@/modules/aws/aws.service';
import { PrismaService } from '@/modules/prisma/prisma.service';

import { formatDateTime } from '@/utils/common';

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
    const inviteCode = uuid();

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
