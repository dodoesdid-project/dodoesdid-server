import { IsPhoneNumber, IsString } from 'class-validator';

export class CheckPhoneDuplicateDto {
  @IsString()
  @IsPhoneNumber('KR')
  readonly phone: string;
}
