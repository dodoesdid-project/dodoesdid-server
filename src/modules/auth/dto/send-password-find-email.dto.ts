import { IsEmail } from 'class-validator';

export class sendPasswordFindEmailDto {
  @IsEmail()
  readonly email: string;
}
