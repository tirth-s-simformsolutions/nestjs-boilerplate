import { PickType } from '@nestjs/swagger';
import { SignupDto } from '../../auth/dtos';

export class UpdateProfileDto extends PickType(SignupDto, ['name']) {}
