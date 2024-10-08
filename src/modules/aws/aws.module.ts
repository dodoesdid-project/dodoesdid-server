import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AwsService } from '@/modules/aws/aws.service';

@Module({
  imports: [ConfigModule],
  providers: [AwsService],
})
export class AwsModule {}
