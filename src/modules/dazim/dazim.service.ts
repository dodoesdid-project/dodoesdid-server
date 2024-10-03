import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '@/modules/prisma/prisma.service';
import * as dayjs from 'dayjs';
import { MemoryStoredFile } from 'nestjs-form-data';
import { AwsService } from '../aws/aws.service';
import { v4 as uuid } from 'uuid';
import { formatDateTime } from '@/utils/common';
import { GroupService } from '../group/group.service';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class DazimService {
  constructor(
    private prismaService: PrismaService,
    private awsService: AwsService,
    private groupService: GroupService,
  ) {}

  async createDazim({
    userId,
    groupId,
    content,
  }: {
    userId: string;
    groupId: string;
    content: string;
  }) {
    // check if group exists
    await this.groupService.checkGroupExistenceAndMembership({
      userId,
      groupId,
    });

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

  async completeDazim({
    userId,
    dazimId,
    photo,
  }: {
    userId: string;
    dazimId: string;
    photo: MemoryStoredFile;
  }) {
    // check if it's mine
    const dazim = await this.getDazimById(dazimId);
    if (userId !== dazim.userId) {
      throw new UnauthorizedException();
    }

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

  async getDazimById(id: string): Promise<{
    id: string;
    userId: string;
    groupId: string;
    content: string;
    photo: string;
    isSuccess: boolean;
    createAt: string;
    updateAt: string;
  }> {
    const dazim = await this.prismaService.dazim.findUnique({
      where: {
        id,
      },
    });

    if (!dazim) {
      throw new NotFoundException('Not found Dazim');
    }

    return {
      id: dazim.id,
      userId: dazim.userId,
      groupId: dazim.groupId,
      content: dazim.content,
      photo: dazim.photo,
      isSuccess: dazim.isSuccess,
      createAt: formatDateTime(dazim.createAt),
      updateAt: formatDateTime(dazim.updateAt),
    };
  }

  async getDazims({
    userId,
    groupId,
    date,
  }: {
    userId: string;
    groupId: string;
    date: string;
  }) {
    // check if member of group
    await this.groupService.checkGroupExistenceAndMembership({
      userId,
      groupId,
    });

    const groupsOnUsers = await this.prismaService.groupsOnUsers.findMany({
      where: { groupId },
      select: {
        user: {
          select: {
            id: true,
            userProfile: {
              select: {
                nickName: true,
                thumbnail: true,
              },
            },
            dazims: {
              where: {
                createAt: {
                  gte: dayjs(date).startOf('day').toDate(),
                  lte: dayjs(date).endOf('day').toDate(),
                },
                groupId,
              },
              select: {
                id: true,
                groupId: true,
                content: true,
                photo: true,
                isSuccess: true,
                createAt: true,
                updateAt: true,
              },
            },
          },
        },
      },
    });

    return (
      groupsOnUsers
        .map((groupsOnUser) => {
          const { user } = groupsOnUser;
          const dazim = user.dazims[0] || null;

          return {
            id: user.id,
            isMe: user.id === userId,
            profile: user.userProfile && {
              nickName: user.userProfile.nickName,
              thumbnail: user.userProfile.thumbnail,
            },
            dazim: dazim && {
              id: dazim.id,
              groupId: dazim.groupId,
              content: dazim.content,
              photo: dazim.photo,
              isSuccess: dazim.isSuccess,
              createAt: formatDateTime(dazim.createAt),
              updateAt: formatDateTime(dazim.updateAt),
            },
          };
        })
        // my dazim first
        .sort((a, b) => {
          if (a.id === userId) return -1;
          if (b.id === userId) return 1;
          return 0;
        })
    );
  }
}
