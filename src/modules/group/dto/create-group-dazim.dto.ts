import { IsString } from 'class-validator';

export class CreateGroupDazimDto {
  @IsString()
  readonly content: string;
}
