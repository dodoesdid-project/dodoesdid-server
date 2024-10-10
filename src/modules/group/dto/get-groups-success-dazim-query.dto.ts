import { IsDateString, IsEnum } from 'class-validator';

export enum DazimSuccessType {
  PERSONAL = 'PERSONAL',
  GROUP = 'GROUP',
}

export class GetGroupsDazimSuccessDatesQueryDto {
  @IsDateString()
  readonly dazimStartDate: string;
  @IsDateString()
  readonly dazimEndDate: string;
  @IsEnum(DazimSuccessType)
  readonly dazimSuccessType: DazimSuccessType;
}
