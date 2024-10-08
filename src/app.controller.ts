import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AppService } from '@/app.service';

@Controller('')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
  ) {}

  @Get('/')
  async App() {
    return {
      app: 'dodoesdid-server',
      environment: this.configService.get('app.environment'),
    };
  }
}
