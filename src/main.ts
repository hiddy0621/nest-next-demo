import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import * as csurf from 'csurf';
import { AppModule } from './app.module';
import { Request } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  // フロントエンドと Cookie ベースで通信するための Cors 設定
  app.enableCors({
    credentials: true,
    origin: ['http://localhost:3000', 'https://nest-next-todo.vercel.app'],
  });
  // フロントエンドからの Cookie を解析
  app.use(cookieParser());
  // csurf で csrf 対策
  // ログインやタスク作成の際に、CSRFトークンが必要になるように設定
  app.use(
    csurf({
      cookie: {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      },
      value: (req: Request) => {
        return req.header('csrf-token');
      },
    }),
  );
  await app.listen(process.env.PORT || 3001);
}
bootstrap();
