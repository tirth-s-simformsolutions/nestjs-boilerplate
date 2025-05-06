import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  createUser(userData: Omit<Prisma.UserCreateInput, 'id'>) {
    return this.prisma.user.create({
      data: userData,
    });
  }

  findOneByCondition(condition: Prisma.UserWhereInput) {
    return this.prisma.user.findFirst({
      where: condition,
    });
  }

  findUserById(userId: string, select?: Prisma.UserSelect) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      ...(select && { select: select }),
    });
  }

  updateUserById(id: string, updatePayload: Prisma.UserUpdateInput) {
    return this.prisma.user.update({
      where: { id },
      data: updatePayload,
    });
  }
}
