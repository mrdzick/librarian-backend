import { INestApplication, ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

export function setupGlobalPipes(app: INestApplication) {
  app.useGlobalPipes(
    new ValidationPipe({
      disableErrorMessages: false,
      transform: true,
  }));
}

export function createSwagger(app: INestApplication) {
  const options = new DocumentBuilder()
    .setTitle('Librarian App')
    .setVersion('1.0.0')
    .build()

  const document = SwaggerModule.createDocument(app, options)
  SwaggerModule.setup('/docs', app, document)
}