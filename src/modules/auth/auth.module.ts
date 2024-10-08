import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from '@/modules/auth/auth.controller';
import { AuthService } from '@/modules/auth/auth.service';
import { GoogleStrategy } from '@/modules/auth/strategies/google.strategy';
import { JwtStrategy } from '@/modules/auth/strategies/jwt.strategy';
import { JwtRefreshStrategy } from '@/modules/auth/strategies/jwt-refresh.strategy';
import { KakaoStrategy } from '@/modules/auth/strategies/kakao.strategy';
import { AwsService } from '@/modules/aws/aws.service';
import { EmailModule } from '@/modules/email/email.module';
import { UserService } from '@/modules/user/user.service';

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
