import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { IS_PUBLIC } from '../../common/constants';
import { ERROR_MSG as AUTH_ERROR_MSG } from '../../modules/auth/messages';
import { AuthService } from '../../modules/auth/auth.service';
import { handleError, verifyToken } from '../../common/utils';
import { ITokenPayload } from 'src/modules/auth/interfaces';
import { USER_STATUS } from 'src/modules/user/user.constant';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
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
      const decode = await verifyToken<ITokenPayload>(
        token,
        accessTokenSecretKey,
      );

      if (decode.error) {
        throw new UnauthorizedException(decode.error);
      }

      if (!decode.data?.userId) {
        throw new UnauthorizedException(AUTH_ERROR_MSG.UNAUTHORIZED);
      }

      const loginUserInfo = await this.authService.findUserById(
        decode.data?.userId,
      );

      if (!loginUserInfo) {
        throw new UnauthorizedException(AUTH_ERROR_MSG.UNAUTHORIZED);
      }

      if (loginUserInfo.status !== USER_STATUS.ACTIVE) {
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
