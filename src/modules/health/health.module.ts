import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { HealthController } from '@/modules/health/health.controller';
import { PrismaModule } from '@/modules/prisma/prisma.module';

@Module({
  imports: [TerminusModule, HttpModule, PrismaModule],
  controllers: [HealthController],
})
export class HealthModule {}
