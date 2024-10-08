import { IsPhoneNumber, IsString } from 'class-validator';

export class FindEmailDto {
  @IsString()
  @IsPhoneNumber('KR')
  readonly phone: string;
}
