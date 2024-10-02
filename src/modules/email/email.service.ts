import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';

import { PrismaService } from '@/modules/prisma/prisma.service';

@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async sendEmailSignInCode(email: string) {
    const clientUrl = this.configService.get('app.clientUrl');
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await this.prismaService.emailAuth.upsert({
      where: { email },
      update: { code },
      create: { email, code },
    });
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: '두더지 이메일 인증',
        template: 'email-login.ejs',
        context: {
          clientUrl: clientUrl,
          code,
        },
      });
    } catch (e) {
      throw new InternalServerErrorException('Failed To Send Email');
    }
  }

  async sendPasswordFindEmail({
    email,
    accessToken,
  }: {
    email: string;
    accessToken: string;
  }) {
    const clientUrl = this.configService.get('app.clientUrl');

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: '두더지 비밀번호 찾기',
        template: 'email-password-find.ejs',
        context: {
          clientUrl: clientUrl,
          accessToken,
        },
      });
    } catch (e) {
      throw new InternalServerErrorException('Failed To Send Email');
    }
  }
}
