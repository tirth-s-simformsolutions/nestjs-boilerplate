import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [UserModule, JwtModule.register({ global: true }), RabbitMQModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
