import { IsBoolean, IsString } from 'class-validator';

export class SignInDto {
  @IsString()
  readonly email: string;
  @IsString()
  readonly password: string;
  @IsBoolean()
  readonly isAuto: boolean;
}
