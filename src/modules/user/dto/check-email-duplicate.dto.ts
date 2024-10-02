import { IsEmail } from 'class-validator';

export class CheckEmailDuplicateDto {
  @IsEmail()
  readonly email: string;
}
