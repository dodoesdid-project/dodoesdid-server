import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Provider } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dayjs from 'dayjs';

import { PrismaService } from '@/modules/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  generateJwtToken(id: string) {
    return this.jwtService.sign(
      {
        sub: id,
      },
      {
        secret: this.configService.get('jwt.secret'),
        expiresIn: 1000 * 60 * 60,
        issuer: this.configService.get('app.host'),
      },
    );
  }

  generateJwtRefreshToken(id: string) {
    return this.jwtService.sign(
      { sub: id },
      {
        secret: this.configService.get('jwt.refreshSecret'),
        expiresIn: 1000 * 60 * 60 * 24 * 30,
        issuer: this.configService.get('app.host'),
      },
    );
  }

  async signIn({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Email or password does not match');
    }

    if (user.isWithdrawal) {
      throw new ForbiddenException('Withdrawal User');
    }

    return {
      accessToken: this.generateJwtToken(user.id),
      refreshToken: this.generateJwtRefreshToken(user.id),
    };
  }

  async verifyEmail({ email, code }: { email: string; code: string }) {
    const emailAuth = await this.prismaService.emailAuth.findUnique({
      where: {
        code,
        email_emailAuthType: {
          email,
          emailAuthType: 'SIGNIN',
        },
        createAt: {
          lte: dayjs().add(24, 'hour').toDate(),
        },
      },
    });

    if (!emailAuth) {
      throw new NotFoundException('Code Not Found');
    }

    if (!(dayjs().diff(dayjs(emailAuth.updateAt)) <= 24 * 60 * 60 * 1000)) {
      throw new ForbiddenException('Validity Time Expiration');
    }
  }

  async getTokenByCode(code: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const emailAuth = await this.prismaService.emailAuth.findUnique({
      where: { code },
    });

    if (!emailAuth) {
      throw new NotFoundException('Code Not Found');
    }

    if (!(dayjs().diff(dayjs(emailAuth.updateAt)) <= 24 * 60 * 60 * 1000)) {
      throw new ForbiddenException('Validity Time Expiration');
    }
    await this.prismaService.emailAuth.update({
      data: {
        used: true,
      },
      where: {
        code,
      },
    });

    const user = await this.prismaService.user.findUnique({
      where: {
        email: emailAuth.email,
      },
    });

    return {
      accessToken: this.generateJwtToken(user.id),
      refreshToken: this.generateJwtRefreshToken(user.id),
    };
  }

  async getTokenBySocial({
    id,
    provider,
    name,
    email,
    thumbnail,
  }: {
    id: string;
    provider: Provider;
    name: string;
    email: string;
    thumbnail: string;
  }): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const socialAccount = await this.prismaService.socialAccount.upsert({
      where: {
        socialId_provider: {
          socialId: id,
          provider,
        },
      },
      update: {},
      create: {
        socialId: id,
        provider,
        user: {
          connectOrCreate: {
            where: { email },
            create: {
              name,
              email,
              userProfile: {
                create: {
                  nickName: name,
                  thumbnail,
                },
              },
            },
          },
        },
      },
      include: {
        user: true,
      },
    });

    return {
      accessToken: this.generateJwtToken(socialAccount.user.id),
      refreshToken: this.generateJwtRefreshToken(socialAccount.user.id),
    };
  }

  async findEmailByPhone(phone: string): Promise<string> {
    const user = await this.prismaService.user.findFirst({
      where: {
        phone,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.email;
  }
}
