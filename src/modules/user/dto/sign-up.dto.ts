import {
  IsDateString,
  IsEmail,
  IsPhoneNumber,
  IsString,
  Matches,
} from 'class-validator';

export class SignUpDto {
  @IsEmail()
  readonly email: string;
  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/, {
    message:
      'password must be at least 8 characters long and contain uppercase, lowercase letters, and special characters.',
  })
  readonly password: string;
  @IsString()
  readonly name: string;
  @IsDateString()
  readonly birth: string;
  @IsString()
  @IsPhoneNumber('KR')
  readonly phone: string;
}
