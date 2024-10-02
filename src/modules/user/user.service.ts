import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/modules/prisma/prisma.service';
import * as dayjs from 'dayjs';
import * as bcrypt from 'bcrypt';
import { User } from '@/common/decorators/user.decorator';
import { MemoryStoredFile } from 'nestjs-form-data';
import { AwsService } from '../aws/aws.service';
import { v4 as uuid } from 'uuid';

@Injectable()
export class UserService {
  constructor(
    private prismaService: PrismaService,
    private awsService: AwsService,
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
        joined: true,
      },
      where: {
        email,
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
}
