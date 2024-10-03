import { IsArray, IsString } from 'class-validator';

export class UpdateGroupNameDto {
  @IsString()
  readonly name: string;
}
