import { IsString } from 'class-validator';

export class verifyPasswordFindCodeDto {
  @IsString()
  readonly code: string;
}
