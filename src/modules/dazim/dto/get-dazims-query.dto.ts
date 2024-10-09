import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class GetDazimsQueryDto {
  @Transform(({ value }) => value === 'true')
  @IsOptional()
  @IsBoolean()
  readonly isSuccess?: boolean;
}
