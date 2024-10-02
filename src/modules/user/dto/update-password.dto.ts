import { IsString, Matches } from 'class-validator';

export class UpdatePasswordDto {
  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/, {
    message:
      'password must be at least 8 characters long and contain uppercase, lowercase letters, and special characters.',
  })
  readonly password: string;
}
