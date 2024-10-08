import { Global, Module } from '@nestjs/common';

import { PrismaHealthIndicator } from '@/modules/prisma/prisma.health-indicator';
import { PrismaService } from '@/modules/prisma/prisma.service';

@Global()
@Module({
  providers: [PrismaService, PrismaHealthIndicator],
  exports: [PrismaService, PrismaHealthIndicator],
})
export class PrismaModule {}
