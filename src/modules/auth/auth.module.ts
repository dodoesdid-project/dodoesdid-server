import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { KakaoStrategy } from './strategies/kakao.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailModule } from '../email/email.module';
import { UserService } from '../user/user.service';
import { AwsModule } from '../aws/aws.module';
import { AwsService } from '../aws/aws.service';

@Module({
  imports: [
    EmailModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('jwt.secret'),
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserService,
    JwtStrategy,
    JwtRefreshStrategy,
    KakaoStrategy,
    GoogleStrategy,
    AwsService,
  ],
})
export class AuthModule {}
