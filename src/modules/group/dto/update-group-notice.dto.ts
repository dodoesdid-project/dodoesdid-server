import { IsString } from 'class-validator';

export class UpdateGroupNoticeDto {
  @IsString()
  readonly notice: string;
}
