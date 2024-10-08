import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import * as shortId from 'shortid';

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
      where: {
        email_emailAuthType: {
          email,
          emailAuthType: 'SIGNIN',
        },
      },
      update: { code },
      create: { email, code, emailAuthType: 'SIGNIN' },
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

  async sendPasswordFindEmail(email: string) {
    const clientUrl = this.configService.get('app.clientUrl');
    const code = shortId.generate();

    await this.prismaService.emailAuth.upsert({
      where: {
        email_emailAuthType: {
          email,
          emailAuthType: 'PASSWORD',
        },
      },
      update: { code },
      create: { email, code, emailAuthType: 'PASSWORD' },
    });

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: '두더지 비밀번호 찾기',
        template: 'email-password-find.ejs',
        context: {
          clientUrl: clientUrl,
          code,
        },
      });
    } catch (e) {
      throw new InternalServerErrorException('Failed To Send Email');
    }
  }
}
