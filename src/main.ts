import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');


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