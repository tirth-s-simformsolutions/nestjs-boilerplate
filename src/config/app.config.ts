import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  sentryDsn: process.env.SENTRY_DSN,
  passwordSaltRound: process.env.PASSWORD_SALT_ROUND,
}));
