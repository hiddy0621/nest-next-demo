import { ForbiddenException, Injectable } from '@nestjs/common';
import { Task, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TodoService {
  constructor(private readonly prisma: PrismaService) {}

  // ログインしてるユーザーのタスクだけを取得
  getTasks(userId: number): Promise<Task[]> {
    return this.prisma.task.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // 特定 ID のタスクを取得
  getTaskById(userId: number, taskId: number): Promise<Task> {
    return this.prisma.task.findFirst({
      where: {
        userId,
        id: taskId,
      },
    });
  }

  // タスクを作成
  async createTask(userId: number, dto: CreateTaskDto): Promise<Task> {
    const task = await this.prisma.task.create({
      data: {
        userId,
        ...dto,
      },
    });
    return task;
  }

  // タスクの内容を更新
  async updateTask(
    userId: number,
    taskId: number,
    dto: UpdateTaskDto,
  ): Promise<Task> {
    const task = await this.prisma.task.findUnique({
      where: {
        id: taskId,
      },
    });
    if (!task || task.userId !== userId) {
      throw new ForbiddenException('No Permission to Update');
    }
    return this.prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        ...dto,
      },
    });
  }

  // タスクを削除
  async deleteTaskById(userId: number, taskId: number): Promise<void> {
    const task = await this.prisma.task.findUnique({
      where: {
        id: taskId,
      },
    });
    if (!task || task.userId !== userId) {
      throw new ForbiddenException('No Permission to Delete');
    }
    await this.prisma.task.delete({
      where: {
        id: taskId,
      },
    });
    return;
  }
}
