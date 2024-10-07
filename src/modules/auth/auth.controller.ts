import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { SendEmailVerificationCodeDto } from './dto/send-email-verification-code.dto';
import { EmailService } from '../email/email.service';
import { Response, Send } from 'express';
import { verifyPasswordFindCodeDto } from './dto/verify-password-find-code.dto';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { resetTokensCookie, setTokensCookie } from '@/utils/token';
import { KakaoAuthGuard } from './guards/kakao.guards';
import { SocialUser } from '@/common/decorators/social-user.decorator';
import { ConfigService } from '@nestjs/config';
import { GoogleAuthGuard } from './guards/google.guards';
import { FindEmailDto } from './dto/find-email.dto';
import { sendPasswordFindEmailDto } from './dto/send-password-find-email.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly emailService: EmailService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('sign-in')
  async signIn(
    @Body() { email, password, isAuto }: SignInDto,
    @Res() res: Response,
  ) {
    const token = await this.authService.signIn({ email, password });
    const accessTokenCookieOptions = isAuto
      ? { maxAge: 1000 * 60 * 60 * 24 * 3 }
      : undefined;
    setTokensCookie(res, token, accessTokenCookieOptions);
    res.status(HttpStatus.NO_CONTENT).send();
  }

  @UseGuards(KakaoAuthGuard)
  @Get('kakao-sign-in')
  async signInByKakao() {}

  @UseGuards(KakaoAuthGuard)
  @Get('kakao-sign-in/redirect')
  async signInByKakaoRedirect(
    @SocialUser() socialUser: SocialUser,
    @Res() res: Response,
  ) {
    const { id, email, name, thumbnail } = socialUser;
    const token = await this.authService.getTokenBySocial({
      id,
      provider: 'KAKAO',
      name,
      email,
      thumbnail,
    });
    setTokensCookie(res, token);
    res.redirect(this.configService.get<string>('app.clientUrl'));
  }

  @UseGuards(GoogleAuthGuard)
  @Get('google-sign-in')
  async signInByGoogle() {}

  @UseGuards(GoogleAuthGuard)
  @Get('google-sign-in/redirect')
  async signInByGoogleRedirect(
    @SocialUser() socialUser: SocialUser,
    @Res() res: Response,
  ) {
    const { id, email, name, thumbnail } = socialUser;
    const token = await this.authService.getTokenBySocial({
      id,
      provider: 'GOOGLE',
      name,
      email,
      thumbnail,
    });
    setTokensCookie(res, token);
    res.redirect(this.configService.get<string>('app.clientUrl'));
  }

  @Post('/email-verification-code-send')
  async sendEmailVerificationCode(
    @Body() { email }: SendEmailVerificationCodeDto,
    @Res() res: Response,
  ) {
    await this.emailService.sendEmailSignInCode(email);
    res.status(HttpStatus.NO_CONTENT).send();
  }

  @Post('/email-verify')
  async verifyEmail(
    @Body() { email, code }: VerifyEmailDto,
    @Res() res: Response,
  ) {
    await this.authService.verifyEmail({
      email,
      code,
    });
    res.status(HttpStatus.NO_CONTENT).send();
  }

  @Post('/email-find')
  async findEmail(@Body() { phone }: FindEmailDto, @Res() res: Response) {
    const email = await this.authService.findEmailByPhone(phone);
    res.status(HttpStatus.OK).send({ email });
  }

  @Post('/password-find-email-send')
  async sendPasswordFindVerificationCode(
    @Body() { email }: sendPasswordFindEmailDto,
    @Res() res: Response,
  ) {
    await this.emailService.sendPasswordFindEmail(email);
    res.status(HttpStatus.NO_CONTENT).send();
  }

  @Post('/password-find-code-verify')
  async verifyPasswordFindCode(
    @Body() { code }: verifyPasswordFindCodeDto,
    @Res() res: Response,
  ) {
    const token = await this.authService.getTokenByCode(code);
    setTokensCookie(res, token);
    res.status(HttpStatus.NO_CONTENT).send();
  }

  @Post('sign-out')
  async signOut(@Res() res: Response) {
    resetTokensCookie(res);
    res.status(HttpStatus.NO_CONTENT).send();
  }
}
