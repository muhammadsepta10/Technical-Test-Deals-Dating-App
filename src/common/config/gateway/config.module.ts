import {Module} from '@nestjs/common';
import {GatewayConfigService} from './config.service';
import {ConfigModule, ConfigService} from '@nestjs/config';
import configuration from "./index"
import * as Joi from "joi"

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: process.env.NODE_ENV === 'development' ? `.env.${process.env.NODE_ENV}` : `.env`,
            load: [configuration],
            validationSchema: Joi.object({
                MAIL_USER: Joi.string(),
                MAIL_PASS: Joi.string(),
            }),
        }),
    ],
    providers: [ConfigService, GatewayConfigService],
    exports: [ConfigService, GatewayConfigService]
})
export class GatewayConfigModule { }
