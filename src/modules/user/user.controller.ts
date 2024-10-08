import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Patch,
  Post,
  Put,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { FormDataRequest, MemoryStoredFile } from 'nestjs-form-data';

import { User } from '@/common/decorators/user.decorator';

import { JwtAuthGuard } from '@/modules/auth/guards/jwt.guard';
import { CheckEmailDuplicateDto } from '@/modules/user/dto/check-email-duplicate.dto';
import { CheckPhoneDuplicateDto } from '@/modules/user/dto/check-phon-duplicate.dto';
import { CreateProfileDto } from '@/modules/user/dto/create-profile.dto';
import { SignUpDto } from '@/modules/user/dto/sign-up.dto';
import { UpdateNickNameDto } from '@/modules/user/dto/update-nick-name.dto';
import { UpdatePasswordDto } from '@/modules/user/dto/update-password.dto';
import { UpdateProfileDto } from '@/modules/user/dto/update-profile.dto';
import { withdrawalDto } from '@/modules/user/dto/withdrawal.dto';
import { UserService } from '@/modules/user/user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/sign-up')
  async signUp(
    @Body() { email, password, name, birth, phone }: SignUpDto,
    @Res() res: Response,
  ) {
    await this.userService.signUp({
      email,
      password,
      name,
      birth,
      phone,
    });
    res.status(HttpStatus.CREATED).send({
      message: 'Signup successfully',
    });
  }

  @Post('email-duplicate-check')
  async checkEmailDuplicate(
    @Body() { email }: CheckEmailDuplicateDto,
    @Res() res: Response,
  ) {
    await this.userService.checkDuplicateEmail(email);
    res.status(HttpStatus.NO_CONTENT).send();
  }
  @Post('phone-duplicate-check')
  async checkPhoneDuplicate(
    @Body() { phone }: CheckPhoneDuplicateDto,
    @Res() res: Response,
  ) {
    await this.userService.checkDuplicatePhone(phone);
    res.status(HttpStatus.NO_CONTENT).send();
  }

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  async getMe(@User() user: User, @Res() res: Response) {
    res.status(HttpStatus.OK).send(user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/me/profile')
  @FormDataRequest({ storage: MemoryStoredFile })
  async createProfile(
    @User() user: User,
    @Body() { thumbnail, nickName }: CreateProfileDto,
    @Res() res: Response,
  ) {
    await this.userService.upsertProfile({
      userId: user.id,
      thumbnail,
      nickName,
    });

    res.status(HttpStatus.CREATED).send({
      message: 'Create profile successfully',
    });
  }

  @UseGuards(JwtAuthGuard)
  @FormDataRequest({ storage: MemoryStoredFile })
  @Put('/me/profile')
  async updateProfile(
    @User() user: User,
    @Body() { thumbnail, nickName }: UpdateProfileDto,
    @Res() res: Response,
  ) {
    const updatedProfile = await this.userService.upsertProfile({
      userId: user.id,
      thumbnail,
      nickName,
    });

    res.status(HttpStatus.OK).send(updatedProfile);
  }

  @UseGuards(JwtAuthGuard)
  @FormDataRequest({ storage: MemoryStoredFile })
  @Patch('/me/password')
  async updatePassword(
    @User() user: User,
    @Body() { password }: UpdatePasswordDto,
    @Res() res: Response,
  ) {
    await this.userService.updatePassword({
      userId: user.id,
      password,
    });

    res.status(HttpStatus.NO_CONTENT).send();
  }

  @UseGuards(JwtAuthGuard)
  @FormDataRequest({ storage: MemoryStoredFile })
  @Post('/me/password-verify')
  async verifyPassword(
    @User() user: User,
    @Body() { password }: UpdatePasswordDto,
    @Res() res: Response,
  ) {
    await this.userService.verifyPassword({
      userId: user.id,
      password,
    });

    res.status(HttpStatus.NO_CONTENT).send();
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/me/nickName')
  async updateNickName(
    @User() user: User,
    @Body() { nickName }: UpdateNickNameDto,
    @Res() res: Response,
  ) {
    await this.userService.updateNickName({
      userId: user.id,
      nickName,
    });
    res.status(HttpStatus.NO_CONTENT).send();
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/me/withdrawal')
  async withdrawal(
    @User() user: User,
    @Body() { withdrawalReason }: withdrawalDto,
    @Res() res: Response,
  ) {
    await this.userService.withdrawal({
      userId: user.id,
      withdrawalReason,
    });
    res.status(HttpStatus.NO_CONTENT).send();
  }
}
