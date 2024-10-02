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
    await this.groupService.getGroupById(groupId);

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
    const isGroupMember = await this.groupService.checkIsGroupMember({
      userId,
      groupId,
    });
    if (!isGroupMember) {
      throw new UnauthorizedException();
    }

    // check if my dazim created
    const myDazim = await this.prismaService.dazim.findFirst({
      where: {
        userId,
        createAt: {
          gte: dayjs(date).startOf('day').toDate(),
          lt: dayjs(date).endOf('day').toDate(),
        },
      },
    });

    const isCreatedMyDazim = !!myDazim;

    const dazims = await this.prismaService.dazim.findMany({
      where: {
        groupId,
        createAt: {
          gte: dayjs(date).startOf('day').toDate(),
          lt: dayjs(date).endOf('day').toDate(),
        },
      },
      include: {
        user: {
          include: {
            userProfile: true,
          },
        },
      },
    });

    return {
      isCreatedMyDazim,
      data: dazims
        .map((dazim) => ({
          id: dazim.id,
          content: dazim.content,
          photo: dazim.photo,
          isSuccess: dazim.isSuccess,
          createAt: dazim.createAt,
          updateAt: dazim.updateAt,
          user: {
            id: dazim.user.id,
            isMe: dazim.user.id === userId,
            profile: dazim.user.userProfile && {
              nickName: dazim.user.userProfile.nickName,
              thumbnail: dazim.user.userProfile.thumbnail,
            },
          },
        }))
        // my dazim first
        .sort((a, b) => {
          if (a.user.id === userId) return -1;
          if (b.user.id === userId) return 1;
          return 0;
        }),
    };
  }
}
