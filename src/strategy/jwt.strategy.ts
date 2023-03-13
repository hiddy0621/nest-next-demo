import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    // JWTトークンと秘密鍵でペイロードを復元したい
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => {
          let jwt = null;
          // 今回はCookieを使って、JWT をクライアントから送信する
          // ここでは、Cookie から JWT を取り出す
          if (req && req.cookies) {
            jwt = req.cookies['access_token'];
          }
          return jwt;
        },
      ]),
      // 期限切れのJWTを認めない
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET'),
    });
  }
  // Passport Strategy の抽象メソッド validate を実装
  async validate(payload: { sub: number; email: string }) {
    // 復元されたペイロードでユーザー判定
    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
    });
    delete user.hashedPassword;
    return user;
  }
}
