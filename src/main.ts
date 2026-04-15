import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

   app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            //  remove extra fields
      forbidNonWhitelisted: true, //  throw error if extra fields sent
      transform: true,            //  auto transform types (string → number)
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Multi-Tanent API')
    .setDescription('API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);


  app.use(
    '/docs',
    apiReference({
      content: document,
      theme: 'purple',
      layout: 'modern',
    }),
  );

  if (process.env.NODE_ENV !== 'production') {
    SwaggerModule.setup('swagger', app, document);
  }

  await app.listen(3000);
}
bootstrap();