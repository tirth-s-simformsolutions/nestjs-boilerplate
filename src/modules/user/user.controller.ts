import { Body, Controller, Get, Put } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../core/decorators';
import { UserService } from './user.service';
import { SWAGGER_TAGS } from '../../common/constants';
import {
  GetProfileResponseDto,
  UpdateProfileDto,
  UpdateProfileResponseDto,
} from './dtos';
import { ICurrentUser } from '../../common/interfaces';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiTags(SWAGGER_TAGS.USER)
  @ApiBearerAuth('Authorization')
  @ApiOperation({
    summary: 'Get profile API',
    description: 'This API is used to get profile',
  })
  @ApiOkResponse({
    description: 'Profile fetched successfully',
    type: GetProfileResponseDto,
  })
  @Get('/profile')
  getProfile(@CurrentUser() currentUser: ICurrentUser) {
    return this.userService.getProfile(currentUser.userId);
  }

  @ApiTags(SWAGGER_TAGS.USER)
  @ApiBearerAuth('Authorization')
  @ApiOperation({
    summary: 'Update profile API',
    description: 'This API is used to update profile',
  })
  @ApiOkResponse({
    description: 'Profile updated successfully',
    type: UpdateProfileResponseDto,
  })
  @Put('/profile')
  updateProfile(
    @CurrentUser() currentUser: ICurrentUser,
    @Body() data: UpdateProfileDto,
  ) {
    return this.userService.updateProfile(currentUser.userId, data);
  }
}
