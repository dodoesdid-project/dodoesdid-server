import { IsString } from 'class-validator';

export class UpdateNickNameDto {
  @IsString()
  readonly nickName: string;
}
