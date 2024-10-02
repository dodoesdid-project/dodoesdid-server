import { HasMimeType, IsFile, MemoryStoredFile } from 'nestjs-form-data';

export class CompleteDazimDto {
  @IsFile()
  @HasMimeType(['image/*'])
  readonly photo: MemoryStoredFile;
}
