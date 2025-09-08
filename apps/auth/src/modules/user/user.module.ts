import { Module } from '@nestjs/common';
import { PrismaService } from '@packages/common';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, UserRepository],
  exports: [UserRepository],
})
export class UserModule {}
