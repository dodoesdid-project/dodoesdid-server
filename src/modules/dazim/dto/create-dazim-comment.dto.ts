import { IsString } from 'class-validator';

export class CreateDazimCommentDto {
  @IsString()
  readonly content: string;
}
