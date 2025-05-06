import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { SWAGGER_TAGS } from '../../common/constants';
import { AuthService } from './auth.service';
import {
  SignupResponseDto,
  SignupDto,
  LoginResponseDto,
  LoginDto,
  RefreshTokenDto,
  RefreshTokenResponseDto,
  ChangePasswordResponseDto,
  ChangePasswordDto,
} from './dtos';
import { CurrentUser, Public } from '../../core/decorators';
import { ICurrentUser } from '../../common/interfaces';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiTags(SWAGGER_TAGS.AUTH)
  @ApiOperation({
    summary: 'Sign up for user API',
    description: 'This API is used to register a new user',
  })
  @ApiCreatedResponse({
    description: 'User created successfully',
    type: SignupResponseDto,
  })
  @Public()
  @Post('/signup')
  signup(@Body() data: SignupDto) {
    return this.authService.signup(data);
  }

  @ApiTags(SWAGGER_TAGS.AUTH)
  @ApiOperation({
    summary: 'Login API',
    description: 'This API is used to login',
  })
  @ApiOkResponse({
    description: 'Login successful',
    type: LoginResponseDto,
  })
  @Public()
  @Post('/login')
  login(@Body() data: LoginDto) {
    return this.authService.login(data);
  }

  @ApiTags(SWAGGER_TAGS.AUTH)
  @ApiOperation({
    summary: 'Refresh Token API',
    description:
      'This API is used to create new access token from refresh token',
  })
  @ApiOkResponse({
    description: 'Refresh token generated successfully',
    type: RefreshTokenResponseDto,
  })
  @Public()
  @Post('/refresh-token')
  refreshToken(@Body() data: RefreshTokenDto) {
    return this.authService.refreshToken(data);
  }

  @ApiTags(SWAGGER_TAGS.AUTH)
  @ApiBearerAuth('Authorization')
  @ApiOperation({
    summary: 'Change password API',
    description: 'This API is used to change password',
  })
  @ApiOkResponse({
    description: 'Change password successful',
    type: ChangePasswordResponseDto,
  })
  @Post('/change-password')
  changePassword(
    @CurrentUser() currentUser: ICurrentUser,
    @Body() data: ChangePasswordDto,
  ) {
    return this.authService.changePassword(currentUser.userId, data);
  }
}
