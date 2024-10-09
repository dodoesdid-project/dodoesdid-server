import { IsString } from 'class-validator';

export class updateCommentDto {
  @IsString()
  readonly content: string;
}
