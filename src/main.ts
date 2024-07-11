import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { setupGlobalPipes, createSwagger } from './config/main-config';
import { AppModule } from './app.module';

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
