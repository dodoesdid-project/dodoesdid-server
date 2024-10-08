import { DocumentBuilder } from '@nestjs/swagger';

export class BaseAPIDocumentation {
  public builder = new DocumentBuilder();

  public initializeOptions() {
    return this.builder
      .setTitle('두더지')
      .setDescription('두더지 API 문서입니다.')
      .setVersion('1.0.0')
      .addTag('swagger')
      .build();
  }
}
