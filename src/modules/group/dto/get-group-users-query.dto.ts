import { IsDateString } from 'class-validator';

export class GetGroupUsersQueryDto {
  @IsDateString()
  readonly dazimCreateDate: string;
}
