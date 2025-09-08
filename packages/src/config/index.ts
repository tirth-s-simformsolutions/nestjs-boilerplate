import { registerAs } from '@nestjs/config';

export const commonConfig = [
  registerAs('jwt', () => ({
    accessToken: {
      expire: process.env.JWT_ACCESS_TOKEN_EXPIRE,
      secretKey: process.env.JWT_ACCESS_SECRET_KEY,
    },
    refreshToken: {
      expire: process.env.JWT_REFRESH_TOKEN_EXPIRE,
      secretKey: process.env.JWT_REFRESH_SECRET_KEY,
    },
  })),

  registerAs('database', () => ({
    url: process.env.DATABASE_URL,
  })),
];
