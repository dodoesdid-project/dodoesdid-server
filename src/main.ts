import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { BaseAPIDocumentation } from './swagger.document';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port');
  const environment = configService.get<string>('app.environment');
  const clientUrl = configService.get<string>('app.clientUrl');
  const logger = new Logger('NestApplication');

  app.enableCors({
    origin: [clientUrl],
    credentials: true,
    exposedHeaders: ['Authorization'],
  });
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api/v1', { exclude: ['health'] });

  const config = new BaseAPIDocumentation().initializeOptions();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(port);

  logger.log(`Environment Variable ${environment}`);
  logger.log(`Application is running on ${await app.getUrl()}`);
}
bootstrap();
