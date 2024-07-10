import { NestFactory } from '@nestjs/core';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

function setupGlobalPipes(app: INestApplication) {
  app.useGlobalPipes(
    new ValidationPipe({
      disableErrorMessages: false,
      transform: true,
  }));
}

function createSwagger(app: INestApplication) {
  const options = new DocumentBuilder()
    .setTitle('Librarian App')
    .setVersion('1.0.0')
    .build()

  const document = SwaggerModule.createDocument(app, options)
  SwaggerModule.setup('/docs', app, document)
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  setupGlobalPipes(app);

  const configService = app.get(ConfigService);

  if (configService.get('SWAGGER_ENABLED') === 'true') {
    createSwagger(app);
  }

  await app.listen(configService.get('PORT'), () => {
    console.log(`Server is running on port ${configService.get('PORT')}`);
  });
}

bootstrap();
