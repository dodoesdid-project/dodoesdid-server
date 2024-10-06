import { IsString } from 'class-validator';

export class withdrawalDto {
  @IsString()
  withdrawalReason: string;
}
