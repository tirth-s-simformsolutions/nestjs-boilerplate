import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserStatus } from '@prisma/client';
import { handleError, compareHash, createHash } from '../../common/utils';
import { ERROR_MSG, SUCCESS_MSG } from './messages';
import { ResponseResult } from '../../core/class/';
import {
  ChangePasswordDto,
  LoginDto,
  RefreshTokenDto,
  SignupDto,
} from './dtos';
import { ITokenPayload } from './interfaces';
import { UserRepository } from '../user/user.repository';

@Injectable()
export class AuthService {
  private readonly accessTokenSecretKey: string;
  private readonly refreshTokenSecretKey: string;
  private readonly accessTokenExpire: number | string;
  private readonly refreshTokenExpire: number | string;
  constructor(
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.accessTokenSecretKey = this.configService.get<string>(
      'jwt.accessToken.secretKey',
    );
    this.refreshTokenSecretKey = this.configService.get<string>(
      'jwt.refreshToken.secretKey',
    );
    this.accessTokenExpire = this.configService.get<number | string>(
      'jwt.accessToken.expire',
    );
    this.refreshTokenExpire = this.configService.get<number | string>(
      'jwt.refreshToken.expire',
    );
  }

  async signup(data: SignupDto) {
    try {
      const { email, password, name } = data;

      // validate user email
      await this.validateUserBeforeCreate({ email });

      const createUserPayload = {
        email,
        password: await createHash(password),
        name,
        status: UserStatus.active,
      };

      const createdUserInfo =
        await this.userRepository.createUser(createUserPayload);

      const accessToken = await this.jwtService.signAsync(
        {
          userId: createdUserInfo.id,
        },
        {
          secret: this.accessTokenSecretKey,
          expiresIn: this.accessTokenExpire,
        },
      );

      const refreshToken = await this.jwtService.signAsync(
        {
          userId: createdUserInfo.id,
        },
        {
          secret: this.refreshTokenSecretKey,
          expiresIn: this.refreshTokenExpire,
        },
      );

      const userInfo = await this.userRepository.findUserById(
        createdUserInfo.id,
        {
          id: true,
          email: true,
          name: true,
        },
      );

      return new ResponseResult({
        message: SUCCESS_MSG.USER.CREATED,
        statusCode: HttpStatus.CREATED,
        data: {
          accessToken,
          refreshToken,
          userInfo,
        },
      });
    } catch (error) {
      handleError(error);
    }
  }

  async validateUserBeforeCreate({ email }: Partial<SignupDto>) {
    // Check user exists with same email
    const isEmailRegistered = await this.userRepository.findOneByCondition({
      email,
    });
    if (isEmailRegistered) {
      throw new ConflictException(ERROR_MSG.USER.USER_EXISTS_WITH_SAME_EMAIL);
    }
  }

  async login(data: LoginDto) {
    try {
      const { email, password } = data;

      const isUserFound = await this.userRepository.findOneByCondition({
        email: email,
      });

      // check user exists or not
      const isPasswordValid =
        isUserFound && (await compareHash(password, isUserFound.password));

      if (!isPasswordValid) {
        throw new BadRequestException(ERROR_MSG.INVALID_CREDENTIALS);
      }

      if (isUserFound.status !== UserStatus.active) {
        throw new UnprocessableEntityException(
          ERROR_MSG.USER.ACCOUNT_NOT_ACTIVE,
        );
      }

      const accessToken = await this.jwtService.signAsync(
        {
          userId: isUserFound.id,
        },
        {
          secret: this.accessTokenSecretKey,
          expiresIn: this.accessTokenExpire,
        },
      );

      const refreshToken = await this.jwtService.signAsync(
        {
          userId: isUserFound.id,
        },
        {
          secret: this.refreshTokenSecretKey,
          expiresIn: this.refreshTokenExpire,
        },
      );

      const userInfo = await this.userRepository.findUserById(isUserFound.id, {
        id: true,
        email: true,
        name: true,
      });

      return new ResponseResult({
        message: SUCCESS_MSG.USER.LOGIN,
        data: {
          accessToken,
          refreshToken,
          userInfo,
        },
      });
    } catch (error) {
      handleError(error);
    }
  }

  async refreshToken(data: RefreshTokenDto) {
    try {
      const { refreshToken } = data;

      const tokenData = await this.jwtService.verifyAsync<ITokenPayload>(
        refreshToken,
        { secret: this.refreshTokenSecretKey },
      );

      if (!tokenData?.userId) {
        throw new UnauthorizedException(ERROR_MSG.UNAUTHORIZED);
      }

      const userInfo = await this.userRepository.findUserById(tokenData.userId);

      if (userInfo.status !== UserStatus.active) {
        throw new UnauthorizedException(ERROR_MSG.USER.ACCOUNT_NOT_ACTIVE);
      }

      const accessToken = await this.jwtService.signAsync(
        {
          userId: userInfo.id,
        },
        {
          secret: this.accessTokenSecretKey,
          expiresIn: this.accessTokenExpire,
        },
      );
      const newRefreshToken = await this.jwtService.signAsync(
        {
          userId: userInfo.id,
        },
        {
          secret: this.refreshTokenSecretKey,
          expiresIn: this.refreshTokenExpire,
        },
      );

      return new ResponseResult({
        message: SUCCESS_MSG.USER.REFRESH_TOKEN,
        data: {
          accessToken,
          refreshToken: newRefreshToken,
        },
      });
    } catch (error) {
      if (
        error?.name === 'TokenExpiredError' ||
        error?.name === 'JsonWebTokenError' ||
        (error?.message && error?.message === 'jwt expired')
      ) {
        handleError(new UnauthorizedException(ERROR_MSG.TOKEN_EXPIRED));
      }
      handleError(error);
    }
  }

  async changePassword(userId: string, data: ChangePasswordDto) {
    try {
      const { newPassword, oldPassword } = data;

      const userInfo = await this.userRepository.findUserById(userId, {
        password: true,
      });

      if (newPassword === oldPassword) {
        throw new BadRequestException(ERROR_MSG.PASSWORD.SAME_PASSWORD);
      }

      // check old password
      if (!(await compareHash(oldPassword, userInfo.password))) {
        throw new ConflictException(ERROR_MSG.PASSWORD.INVALID_OLD_PASSWORD);
      }

      const newPasswordHash = await createHash(newPassword);

      await this.userRepository.updateUserById(userId, {
        password: newPasswordHash,
      });

      return new ResponseResult({
        message: SUCCESS_MSG.USER.CHANGE_PASSWORD,
      });
    } catch (error) {
      handleError(error);
    }
  }

  async findUserById(userId: string) {
    const userInfo = await this.userRepository.findUserById(userId);

    return userInfo;
  }
}
