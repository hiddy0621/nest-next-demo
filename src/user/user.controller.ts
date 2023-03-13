import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';
import { Request } from 'express';
import { UpdateUserDto } from './dto/udpate-user.dto';
import { UserService } from './user.service';

// userパスすべてに jwt のauthGuardかける
@UseGuards(AuthGuard('jwt'))
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // ログイン中のユーザーを識別する
  @Get()
  getLoginUser(@Req() req: Request): Omit<User, 'hashedPassword'> {
    // Nest.js がユーザーオブジェクトをリクエストに含んでくれてるので、それを取り出す
    return req.user;
  }

  // ユーザーのニックネーム更新する
  @Patch()
  updateUserNickname(
    @Req() req: Request,
    @Body() dto: UpdateUserDto,
  ): Promise<Omit<User, 'hashedPassword'>> {
    return this.userService.updateUser(req.user.id, dto);
  }
}
