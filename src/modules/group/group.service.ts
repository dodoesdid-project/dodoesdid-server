import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { MemoryStoredFile } from 'nestjs-form-data';
import { AwsService } from '../aws/aws.service';
import { v4 as uuid } from 'uuid';
import { formatDateTime } from '@/utils/common';

@Injectable()
export class GroupService {
  constructor(
    private prismaService: PrismaService,
    private awsService: AwsService,
  ) {}
  async checkGroupExistenceAndMembership({
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

    if (!groupsOnUsers) {
      throw new UnauthorizedException('Not a group member');
    }
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

  async getGroup({ userId, groupId }: { userId: string; groupId: string }) {
    await this.checkGroupExistenceAndMembership({
      userId,
      groupId,
    });

    const group = await this.prismaService.group.findUnique({
      where: {
        id: groupId,
      },
    });

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

  async updateGroupName({
    userId,
    groupId,
    name,
  }: {
    userId: string;
    groupId: string;
    name: string;
  }) {
    await this.checkGroupExistenceAndMembership({ userId, groupId });

    await this.prismaService.group.update({
      data: {
        name,
      },
      where: {
        id: groupId,
      },
    });
  }

  async updateGroupThumbnail({
    userId,
    groupId,
    thumbnail,
  }: {
    userId: string;
    groupId: string;
    thumbnail: MemoryStoredFile;
  }) {
    await this.checkGroupExistenceAndMembership({ userId, groupId });

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
        id: groupId,
      },
    });
  }

  async updateGroupNotice({
    userId,
    groupId,
    notice,
  }: {
    userId: string;
    groupId: string;
    notice: string;
  }) {
    await this.checkGroupExistenceAndMembership({ userId, groupId });

    await this.prismaService.group.update({
      data: {
        notice,
      },
      where: {
        id: groupId,
      },
    });
  }

  async leaveGroup({ userId, groupId }: { userId: string; groupId: string }) {
    await this.checkGroupExistenceAndMembership({ userId, groupId });

    await this.prismaService.groupsOnUsers.delete({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
    });
  }
}
