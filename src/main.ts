import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('trust proxy', 1);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  
  // setInterval(() => {
  //   console.log('rss MB', Math.round(process.memoryUsage().rss / 1e6));
  // }, 1000);
  
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
