import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';

import appConfig from '@/config/app/app.config';
import awsConfig from '@/config/aws/aws.config';
import databaseConfig from '@/config/database/database.config';
import emailConfig from '@/config/email/email.config';
import jwtConfig from '@/config/jwt/jwt.config';
import socialConfig from '@/config/social/social.config';
import validationSchema from '@/config/validation-schema';

import { AuthModule } from '@/modules/auth/auth.module';
import { AwsModule } from '@/modules/aws/aws.module';
import { CommentModule } from '@/modules/comment/comment.module';
import { DazimModule } from '@/modules/dazim/dazim.module';
import { GroupModule } from '@/modules/group/group.module';
import { HealthModule } from '@/modules/health/health.module';
import { PrismaModule } from '@/modules/prisma/prisma.module';
import { UserModule } from '@/modules/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
      load: [
        appConfig,
        databaseConfig,
        emailConfig,
        jwtConfig,
        socialConfig,
        awsConfig,
      ],
      validationSchema,
    }),
    HealthModule,
    PrismaModule,
    AwsModule,
    AuthModule,
    UserModule,
    GroupModule,
    DazimModule,
    CommentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
