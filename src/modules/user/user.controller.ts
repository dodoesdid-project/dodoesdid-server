import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Patch,
  Post,
  Put,
  Res,
  UseGuards,
} from '@nestjs/common';

import { User } from '@/common/decorators/user.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt.guards';

import { UserService } from './user.service';
import { SignUpDto } from './dto/sign-up.dto';

import { Response } from 'express';
import { FormDataRequest, MemoryStoredFile } from 'nestjs-form-data';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { CheckEmailDuplicateDto } from './dto/check-email-duplicate.dto';
import { CheckPhoneDuplicateDto } from './dto/check-phon-duplicate.dto';
import { UpdateNickNameDto } from './dto/update-nick-name.dto';

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
  @Put('/me/password')
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
}
