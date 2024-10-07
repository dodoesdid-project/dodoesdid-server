import { IsEmail, IsNumber, IsString, Length } from 'class-validator';

export class verifyPasswordFindCodeDto {
  @IsString()
  readonly code: string;
}
