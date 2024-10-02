import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { validationSchema } from './config/validation-schema';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import appConfig from './config/app/app.config';
import databaseConfig from './config/database/database.config';
import emailConfig from './config/email/email.config';
import jwtConfig from './config/jwt/jwt.config';
import socialConfig from './config/social/social.config';
import { UserModule } from './modules/user/user.module';
import awsConfig from './config/aws/aws.config';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { AwsModule } from './modules/aws/aws.module';
import { GroupModule } from './modules/group/group.module';
import { DazimModule } from './modules/dazim/dazim.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        `.env.${process.env.NODE_ENV}.local`,
        '.env.local',
        `.env.${process.env.NODE_ENV}`,
        '.env',
      ],
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
    AuthModule,
    UserModule,
    AwsModule,
    GroupModule,
    DazimModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
