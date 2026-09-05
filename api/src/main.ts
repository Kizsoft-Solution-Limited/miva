import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

function corsOrigins(): string | string[] {
  const raw = process.env.CORS_ORIGIN || 'http://localhost:5173';
  const list = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return list.length <= 1 ? list[0] || 'http://localhost:5173' : list;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: corsOrigins(),
    methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.setGlobalPrefix('api');
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
