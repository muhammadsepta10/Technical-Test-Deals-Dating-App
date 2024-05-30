
import {Module} from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';
import * as Joi from 'joi';
import {LogDBConfigService} from './config.service';
import configuration from "./index"
@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: process.env.NODE_ENV === 'development' ? `.env.${process.env.NODE_ENV}` : '.env',
            load: [configuration],
            validationSchema: Joi.object({
                URL: Joi.string(),
                TYPE: Joi.string(),
            }),
        })],
    providers: [ConfigService, LogDBConfigService],
    exports: [ConfigService, LogDBConfigService]
})
export class LogDBConfigModule { }
