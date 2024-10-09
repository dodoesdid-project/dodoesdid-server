import { IsDateString } from 'class-validator';

export class GetGroupUsersQueryDto {
  @IsDateString()
  readonly dazimCreateAt: string;
}
