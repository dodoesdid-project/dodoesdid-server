import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';

import { User } from '@/common/decorators/user.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt.guards';

import { DazimService } from './dazim.service';

import { Response } from 'express';
import { FormDataRequest, MemoryStoredFile } from 'nestjs-form-data';
import { CreateDazimDto } from './dto/create-dazim.dto';
import { CompleteDazimDto } from './dto/complete-dazim.dto';
import { GetDazimsDto } from './dto/get-dazims.dto';

@Controller()
export class DazimController {
  constructor(private readonly dazimService: DazimService) {}
  @UseGuards(JwtAuthGuard)
  @Post('dazim')
  async createDazim(
    @User() user: User,
    @Body() { groupId, content }: CreateDazimDto,
    @Res() res: Response,
  ) {
    await this.dazimService.createDazim({
      userId: user.id,
      groupId,
      content,
    });

    res
      .status(HttpStatus.CREATED)
      .send({ message: 'Create Dazim Successfully' });
  }

  @FormDataRequest({ storage: MemoryStoredFile })
  @UseGuards(JwtAuthGuard)
  @Post('dazim/:dazimId/complete')
  async EnterDazim(
    @User() user: User,
    @Param() { dazimId }: { dazimId: string },
    @Body() { photo }: CompleteDazimDto,
    @Res() res: Response,
  ) {
    await this.dazimService.completeDazim({
      userId: user.id,
      dazimId,
      photo,
    });

    res.status(HttpStatus.NO_CONTENT).send();
  }

  @UseGuards(JwtAuthGuard)
  @Get('group/:groupId/dazims')
  async getDazims(
    @User() user: User,
    @Param() { groupId }: { groupId: string },
    @Query() { date }: GetDazimsDto,
    @Res() res: Response,
  ) {
    const dazims = await this.dazimService.getDazims({
      userId: user.id,
      groupId,
      date,
    });

    res.status(HttpStatus.OK).send(dazims);
  }
}
