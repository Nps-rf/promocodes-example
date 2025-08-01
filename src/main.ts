import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Включаем валидацию глобально
  app.useGlobalPipes(new ValidationPipe());

  // Включаем поддержку cookies
  app.use(cookieParser());

  // Включаем CORS
  app.enableCors({
    credentials: true,
    origin: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
