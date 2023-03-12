import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';
import { Msg, Jwt } from './interfaces/auth.interfaces';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  // ユーザー登録
  async signUp(dto: AuthDto): Promise<Msg> {
    // パスワードのハッシュ化
    const hashed = await bcrypt.hash(dto.password, 12);
    // prisma でユーザー作成
    try {
      await this.prisma.user.create({
        data: {
          email: dto.email,
          hashedPassword: hashed,
        },
      });
      return {
        message: 'ok',
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        // スキーマで定義したユニーク制約に反したパターン
        if (error.code === 'P2002') {
          throw new ForbiddenException('This email is already taken');
        }
      }
      throw error;
    }
  }

  // ログインメソッド
  async login(dto: AuthDto): Promise<Jwt> {
    // prisma で同じメアドの一意なユーザーを検索
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    // 見つからなければ Exception
    if (!user) {
      throw new ForbiddenException('Email or password is incorrect');
    }
    // 有効かどうかチェック
    const isValid = await bcrypt.compare(dto.password, user.hashedPassword);
    if (!isValid) {
      throw new ForbiddenException('Email or password is incorrect');
    }
    return this.generateJwt(user.id, user.email);
  }

  // Jwt 発行
  async generateJwt(userId: number, email: string): Promise<Jwt> {
    const payload = {
      sub: userId,
      email,
    };
    const secret = this.config.get('JWT_SECRET');
    // Jwt サービスを利用してトークン生成
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '5m',
      secret: secret,
    });
    return {
      accessToken: token,
    };
  }
}
