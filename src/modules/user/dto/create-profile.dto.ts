import { IsString } from 'class-validator';
import { HasMimeType, IsFile, MemoryStoredFile } from 'nestjs-form-data';

export class CreateProfileDto {
  @IsFile()
  @HasMimeType(['image/*'])
  thumbnail: MemoryStoredFile;

  @IsString()
  nickName: string;
}
