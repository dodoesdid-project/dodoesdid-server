import { Module } from '@nestjs/common';
import { NestjsFormDataModule } from 'nestjs-form-data';

import { JwtStrategy } from '@/modules/auth/strategies/jwt.strategy';
import { AwsService } from '@/modules/aws/aws.service';
import { FeedController } from '@/modules/feed/feed.controller';
import { FeedService } from '@/modules/feed/feed.service';
import { UserService } from '@/modules/user/user.service';

@Module({
  imports: [NestjsFormDataModule],
  controllers: [FeedController],
  providers: [FeedService, JwtStrategy, AwsService, UserService],
})
export class FeedModule {}
