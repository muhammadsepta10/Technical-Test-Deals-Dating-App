import { Module } from '@nestjs/common';
import { AppConfigService } from './config.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './index';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: process.env.NODE_ENV === 'development' ? `.env.${process.env.NODE_ENV}` : `.env`,
      load: [configuration],
      validationSchema: Joi.object({
        ENV: Joi.string(),
        PORT: Joi.string(),
        VERSION: Joi.string(),
        NAME_PROGRAM: Joi.string(),
        CRYPTO_SECRET: Joi.string(),
        TOKEN_FIREBASE: Joi.string(),
        BASE_URL: Joi.string(),
        MAIL_USER: Joi.string(),
        MAIL_PASS: Joi.string(),
        HOST_REDIS: Joi.string()
      })
    })
  ],
  providers: [ConfigService, AppConfigService],
  exports: [ConfigService, AppConfigService]
})
export class AppConfigModule {}
