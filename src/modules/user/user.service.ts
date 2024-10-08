import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as dayjs from 'dayjs';
import { MemoryStoredFile } from 'nestjs-form-data';
import { v4 as uuid } from 'uuid';

import { User } from '@/common/decorators/user.decorator';

import { AwsService } from '@/modules/aws/aws.service';
import { PrismaService } from '@/modules/prisma/prisma.service';

import { formatDateTime } from '@/utils/common';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly awsService: AwsService,
  ) {}

  async signUp({ email, password, name, birth, phone }) {
    await this.checkDuplicateEmail(email);
    await this.checkDuplicatePhone(phone);

    await this.prismaService.user.create({
      data: {
        email,
        password: await bcrypt.hash(password, 10),
        name,
        birth: dayjs(birth).toISOString(),
        phone,
      },
    });

    await this.prismaService.emailAuth.updateMany({
      data: {
        used: true,
      },
      where: {
        email,
        emailAuthType: 'SIGNIN',
      },
    });
  }
  async checkDuplicateEmail(email: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (user) {
      throw new ConflictException('Already registered user');
    }
  }

  async checkDuplicatePhone(phone: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        phone,
      },
    });

    if (user) {
      throw new ConflictException('Already registered user');
    }
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      include: {
        socialAccounts: {
          select: {
            provider: true,
          },
        },
        userProfile: {
          select: {
            nickName: true,
            thumbnail: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User Not Found');
    }

    if (user.isWithdrawal) {
      throw new ForbiddenException('Withdrawal User');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      birth: user.birth ? dayjs(user.birth).format('YYYY-MM-DD') : null,
      phone: user.phone,
      socials: user.socialAccounts
        ? user.socialAccounts.map((socialAccount) => socialAccount.provider)
        : null,
      profile: user.userProfile,
    };
  }

  async getUsersByGroupId({
    userId,
    groupId,
    dazimCreateDate,
  }: {
    userId: string;
    groupId: string;
    dazimCreateDate: string;
  }) {
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
                createDate: dayjs(dazimCreateDate).endOf('day').toDate(),
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

  async upsertProfile({
    userId,
    thumbnail,
    nickName,
  }: {
    userId: string;
    thumbnail: MemoryStoredFile;
    nickName: string;
  }): Promise<{ id: string; thumbnail: string; nickName: string }> {
    const uploadedThumbnail = await this.awsService.imageUploadToS3({
      buffer: thumbnail.buffer,
      fileName: `user/${userId}/profile/thumbnail/${uuid()}`,
      ext: thumbnail.extension,
    });

    const userProfile = await this.prismaService.userProfile.upsert({
      create: {
        userId,
        nickName,
        thumbnail: uploadedThumbnail,
      },
      update: {
        nickName,
        thumbnail: uploadedThumbnail,
      },
      where: {
        userId,
      },
    });

    return {
      id: userProfile.id,
      thumbnail: userProfile.thumbnail,
      nickName: userProfile.nickName,
    };
  }

  async updatePassword({
    userId,
    password,
  }: {
    userId: string;
    password: string;
  }) {
    await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        password: await bcrypt.hash(password, 10),
      },
    });
  }

  async verifyPassword({
    userId,
    password,
  }: {
    userId: string;
    password: string;
  }) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Password does not match');
    }
  }

  async updateNickName({
    userId,
    nickName,
  }: {
    userId: string;
    nickName: string;
  }) {
    await this.prismaService.userProfile.update({
      where: {
        userId,
      },
      data: {
        nickName,
      },
    });
  }

  async withdrawal({
    userId,
    withdrawalReason,
  }: {
    userId: string;
    withdrawalReason: string;
  }) {
    await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        isWithdrawal: true,
        withdrawalAt: dayjs().toDate(),
        withdrawalReason,
      },
    });
  }
}
