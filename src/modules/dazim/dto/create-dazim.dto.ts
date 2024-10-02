import { IsString } from 'class-validator';

export class CreateDazimDto {
  @IsString()
  readonly groupId: string;
  @IsString()
  readonly content: string;
}
