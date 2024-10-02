import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/modules/prisma/prisma.service';
import * as dayjs from 'dayjs';
import * as bcrypt from 'bcrypt';
import { MemoryStoredFile } from 'nestjs-form-data';
import { AwsService } from '../aws/aws.service';
import { v4 as uuid } from 'uuid';

@Injectable()
export class GroupService {
  constructor(
    private prismaService: PrismaService,
    private awsService: AwsService,
  ) {}
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

    const group = await this.prismaService.group.create({
      data: {
        name,
        thumbnail: uploadedThumbnail,
        inviteCode,
        groupsOnUsers: {
          create: {
            userId,
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

  async getGroupById(groupId: string) {
    const group = await this.prismaService.group.findUnique({
      where: {
        id: groupId,
      },
    });

    if (!group) {
      throw new NotFoundException('Not Found Group');
    }

    return group;
  }

  async getGroupsByUserId(userId: string) {
    const groupOnUsers = await this.prismaService.groupsOnUsers.findMany({
      where: {
        userId,
      },
      select: {
        group: true,
      },
    });

    return groupOnUsers.map((groupOnUser) => groupOnUser.group);
  }

  async checkIsGroupMember({
    userId,
    groupId,
  }: {
    userId: string;
    groupId: string;
  }): Promise<boolean> {
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
}
