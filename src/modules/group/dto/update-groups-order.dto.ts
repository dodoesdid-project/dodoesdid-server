import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class UpdateGroupsOrderDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('all', { each: true })
  readonly ids: string[];
}
