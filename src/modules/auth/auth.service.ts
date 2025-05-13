import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  generateJwtToken,
  handleError,
  comparePassword,
  hashPassword,
  verifyToken,
} from '../../common/utils';
import { UserRepository } from '../../database/repositories';
import { ERROR_MSG, SUCCESS_MSG } from './messages';
import { TOKEN_TYPE, USER_STATUS } from '../../common/constants';
import { ResponseResult } from '../../core/class/';
import {
  ChangePasswordDto,
  LoginDto,
  RefreshTokenDto,
  SignupDto,
} from './dtos';
import { ITokenPayload } from './interfaces';

@Injectable()
export class AuthService {
  private readonly accessTokenSecretKey: string;
  private readonly refreshTokenSecretKey: string;
  private readonly accessTokenExpire: string;
  private readonly refreshTokenExpire: string;
  constructor(
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
  ) {
    this.accessTokenSecretKey = this.configService.get<string>(
      'jwt.accessToken.secretKey',
    );
    this.refreshTokenSecretKey = this.configService.get<string>(
      'jwt.refreshToken.secretKey',
    );
    this.accessTokenExpire = this.configService.get<string>(
      'jwt.accessToken.expire',
    );
    this.refreshTokenExpire = this.configService.get<string>(
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
        password: await hashPassword(
          password,
          this.configService.get<number>('app.passwordSaltRound'),
        ),
        name,
        status: USER_STATUS.ACTIVE,
      };

      const createdUserInfo =
        await this.userRepository.createUser(createUserPayload);

      const accessToken = generateJwtToken(
        {
          userId: createdUserInfo.id,
          tokenType: TOKEN_TYPE.ACCESS_TOKEN,
        },
        this.accessTokenSecretKey,
        this.accessTokenExpire,
      );
      const refreshToken = generateJwtToken(
        {
          userId: createdUserInfo.id,
          tokenType: TOKEN_TYPE.REFRESH_TOKEN,
        },
        this.refreshTokenSecretKey,
        this.refreshTokenExpire,
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
        isUserFound && (await comparePassword(password, isUserFound.password));

      if (!isPasswordValid) {
        throw new BadRequestException(ERROR_MSG.INVALID_CREDENTIALS);
      }

      if (isUserFound.status !== USER_STATUS.ACTIVE) {
        throw new UnprocessableEntityException(
          ERROR_MSG.USER.ACCOUNT_NOT_ACTIVE,
        );
      }

      const accessToken = generateJwtToken(
        {
          userId: isUserFound.id,
          tokenType: TOKEN_TYPE.ACCESS_TOKEN,
        },
        this.accessTokenSecretKey,
        this.accessTokenExpire,
      );
      const refreshToken = generateJwtToken(
        {
          userId: isUserFound.id,
          tokenType: TOKEN_TYPE.REFRESH_TOKEN,
        },
        this.refreshTokenSecretKey,
        this.refreshTokenExpire,
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

      const tokenData = await verifyToken<ITokenPayload>(
        refreshToken,
        this.refreshTokenSecretKey,
      );

      if (
        !tokenData.data?.userId ||
        tokenData.data?.tokenType !== TOKEN_TYPE.REFRESH_TOKEN
      ) {
        throw new UnauthorizedException(ERROR_MSG.UNAUTHORIZED);
      }

      const userInfo = await this.userRepository.findUserById(
        tokenData.data.userId,
      );

      if (userInfo.status !== USER_STATUS.ACTIVE) {
        throw new UnauthorizedException(ERROR_MSG.USER.ACCOUNT_NOT_ACTIVE);
      }

      const accessToken = generateJwtToken(
        {
          userId: userInfo.id,
          tokenType: TOKEN_TYPE.ACCESS_TOKEN,
        },
        this.accessTokenSecretKey,
        this.accessTokenExpire,
      );
      const newRefreshToken = generateJwtToken(
        {
          userId: userInfo.id,
          tokenType: TOKEN_TYPE.REFRESH_TOKEN,
        },
        this.refreshTokenSecretKey,
        this.refreshTokenExpire,
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
      if (!(await comparePassword(oldPassword, userInfo.password))) {
        throw new ConflictException(ERROR_MSG.PASSWORD.INVALID_OLD_PASSWORD);
      }

      const newPasswordHash = await hashPassword(
        newPassword,
        this.configService.get<number>('app.passwordSaltRound'),
      );

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
