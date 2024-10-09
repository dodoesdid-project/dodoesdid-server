import { IsString } from 'class-validator';

export class replyCommentDto {
  @IsString()
  readonly content: string;
}
