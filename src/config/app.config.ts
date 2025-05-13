import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  env: process.env.NODE_ENV,
  port: parseInt(process.env.PORT, 10),
  sentryDsn: process.env.SENTRY_DSN,
  passwordSaltRound: parseInt(process.env.PASSWORD_SALT_ROUND, 10),
}));
