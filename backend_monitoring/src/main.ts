import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const application = await NestFactory.create(AppModule);

  application.setGlobalPrefix('api');

  application.use(cookieParser());

  application.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  application.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const applicationPort = process.env.PORT ?? 3002;
  await application.listen(applicationPort);
}

await bootstrap();
