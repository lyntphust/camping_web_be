import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

import * as cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.enableCors({ origin: '*' });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('NestJS API')
    .setDescription('The NestJS API description')
    .setVersion('1.0')
    .addTag('nestjs')
    .addBearerAuth() // Add Bearer auth to Swagger
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.SERVER_PORT);
}
bootstrap();
