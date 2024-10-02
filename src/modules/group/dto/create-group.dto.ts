import { IsString } from 'class-validator';
import { HasMimeType, IsFile, MemoryStoredFile } from 'nestjs-form-data';

export class CreateGroupDto {
  @IsFile()
  @HasMimeType(['image/*'])
  readonly thumbnail: MemoryStoredFile;

  @IsString()
  readonly name: string;
}
