import { HttpException, InternalServerErrorException } from '@nestjs/common';

export const handleError = (error: Error | unknown): void => {
  if (error instanceof HttpException) {
    throw new HttpException({ message: error.message }, error.getStatus());
  } else {
    throw new InternalServerErrorException(error);
  }
};
