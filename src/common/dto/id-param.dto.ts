import { IsString, IsUUID } from 'class-validator';

export class IdParamDto {
  @IsString()
  @IsUUID()
  readonly id: string;
}
