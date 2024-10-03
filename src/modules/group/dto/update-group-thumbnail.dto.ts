import { IsArray, IsString } from 'class-validator';
import { HasMimeType, IsFile, MemoryStoredFile } from 'nestjs-form-data';

export class UpdateGroupThumbnailDto {
  @IsFile()
  @HasMimeType(['image/*'])
  readonly thumbnail: MemoryStoredFile;
}
