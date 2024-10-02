import { IsString } from 'class-validator';

export class EnterGroupDto {
  @IsString()
  readonly inviteCode: string;
}
