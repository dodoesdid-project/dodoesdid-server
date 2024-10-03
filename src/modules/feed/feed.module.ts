import { Module } from '@nestjs/common';

import { JwtStrategy } from '@/modules/auth/strategies/jwt.strategy';

import { FeedController } from './feed.controller';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { AwsService } from '../aws/aws.service';
import { FeedService } from './feed.service';
import { UserService } from '../user/user.service';

@Module({
  imports: [NestjsFormDataModule],
  controllers: [FeedController],
  providers: [FeedService, JwtStrategy, AwsService, UserService],
})
export class FeedModule {}
