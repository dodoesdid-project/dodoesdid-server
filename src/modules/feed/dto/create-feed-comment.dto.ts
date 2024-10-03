import { IsString } from 'class-validator';

export class CreateFeedCommentDto {
  @IsString()
  readonly content: string;
}
