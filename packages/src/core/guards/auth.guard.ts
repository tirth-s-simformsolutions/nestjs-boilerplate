import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { UserStatus } from '@prisma/client';
import {
  AUTH_ERROR_MSG,
  IS_PUBLIC,
  ITokenPayload,
  handleError,
} from '../../common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();

      const isPublic = this.reflector.get<string>(
        IS_PUBLIC,
        context.getHandler(),
      );

      if (isPublic) {
        return true;
      }

      // Get token from cookies instead of authorization header
      const token = request.cookies?.access_token;

      if (!token) {
        throw new UnauthorizedException(AUTH_ERROR_MSG.UNAUTHORIZED);
      }

      // check token
      if (!token) {
        throw new UnauthorizedException(AUTH_ERROR_MSG.UNAUTHORIZED);
      }

      const decode = await this.jwtService.verifyAsync<ITokenPayload>(token, {
        secret: this.configService.get<string>('jwt.accessToken.secretKey'),
      });

      if (!decode?.userId) {
        throw new UnauthorizedException(AUTH_ERROR_MSG.UNAUTHORIZED);
      }

      const loginUserInfo = await this.prisma.user.findUnique({
        where: { id: decode?.userId },
      });

      if (!loginUserInfo) {
        throw new UnauthorizedException(AUTH_ERROR_MSG.UNAUTHORIZED);
      }

      if (loginUserInfo.status !== UserStatus.active) {
        throw new UnauthorizedException(AUTH_ERROR_MSG.USER.ACCOUNT_NOT_ACTIVE);
      }

      request.userId = loginUserInfo.id;
      request.name = loginUserInfo.name;

      return true;
    } catch (error) {
      handleError(error);
    }
  }
}
