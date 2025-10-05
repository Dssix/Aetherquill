import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- Add this block ---
  app.enableCors({
    origin: process.env.CLIENT_URL, // Use the variable from .env
    credentials: true,
  });
  // ----------------------
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap().catch((err) => {
  console.error('Fatal error during application bootstrap', err);
});
