import { IsString } from 'class-validator';
import { HasMimeType, IsFile, MemoryStoredFile } from 'nestjs-form-data';

export class UpdateProfileDto {
  @IsFile()
  @HasMimeType(['image/*'])
  thumbnail: MemoryStoredFile;

  @IsString()
  nickName: string;
}
