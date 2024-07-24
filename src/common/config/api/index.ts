import { registerAs } from '@nestjs/config';
export default registerAs('app', () => ({
  NODE_ENV: process.env.NODE_ENV,
  APP_PORT: process.env.APP_PORT,
  APP_VERSION: process.env.APP_VERSION,
  NAME_PROGRAM: process.env.NAME_PROGRAM,
  CRYPTO_SECRET: process.env.CRYPTO_SECRET,
  TOKEN_FIREBASE: process.env.TOKEN_FIREBASE,
  BASE_URL: process.env.BASE_URL,
  HOST_REDIS: process.env.HOST_REDIS,
  MAIL_USER: process.env.MAIL_USER,
  MAIL_PASS: process.env.MAIL_PASS
}));
