import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  // フロントエンドと Cookie ベースで通信するための Cors 設定
  app.enableCors({
    credentials: true,
    origin: ['http://localhost:3000'],
  });
  // フロントエンドからの Cookie を解析
  app.use(cookieParser());
  await app.listen(3001);
}
bootstrap();
