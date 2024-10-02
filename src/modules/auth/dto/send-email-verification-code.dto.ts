import { IsEmail } from 'class-validator';

export class SendEmailVerificationCodeDto {
  @IsEmail()
  readonly email: string;
}
