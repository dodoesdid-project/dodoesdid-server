import { IsDateString } from 'class-validator';

export class GetDazimsDto {
  @IsDateString()
  readonly date: string;
}
