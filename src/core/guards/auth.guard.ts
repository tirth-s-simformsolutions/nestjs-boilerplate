import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC } from '../../common/constants';
import { ERROR_MSG as AUTH_ERROR_MSG } from '../../modules/auth/messages';
import { AuthService } from '../../modules/auth/auth.service';
import { handleError } from '../../common/utils';
import { ITokenPayload } from 'src/modules/auth/interfaces';
import { UserStatus } from '@prisma/client';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
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

      const authToken = request.headers['authorization'];
      if (!authToken) {
        throw new UnauthorizedException(AUTH_ERROR_MSG.UNAUTHORIZED);
      }
      const token = authToken.replace('Bearer ', '')?.trim();

      // check token
      if (!token) {
        throw new UnauthorizedException(AUTH_ERROR_MSG.UNAUTHORIZED);
      }

      const accessTokenSecretKey = this.configService.get<string>(
        'jwt.accessToken.secretKey',
      );
      const decode = await this.jwtService.verifyAsync<ITokenPayload>(token, {
        secret: accessTokenSecretKey,
      });

      if (!decode?.userId) {
        throw new UnauthorizedException(AUTH_ERROR_MSG.UNAUTHORIZED);
      }

      const loginUserInfo = await this.authService.findUserById(decode?.userId);

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
      if (
        error?.name === 'TokenExpiredError' ||
        error?.name === 'JsonWebTokenError' ||
        (error?.message && error?.message === 'jwt expired')
      ) {
        handleError(new UnauthorizedException(AUTH_ERROR_MSG.TOKEN_EXPIRED));
      }
      handleError(error);
    }
  }
}
