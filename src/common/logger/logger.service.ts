import {Logger} from "@nestjs/common";
import { MetaDTO } from "../dto";
import * as winston from 'winston';
import * as MongoDB from 'winston-mongodb';

export class LoggerService {
    private logger: winston.Logger
    constructor(
    ) {
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.json(),
            transports: [
                new MongoDB.MongoDB({
                    level: 'info',
                    db: process.env.LOG_DB_URL,
                    collection: 'logs',
                    options: {
                        useUnifiedTopology: true
                    },
                    format: winston.format.metadata()
                }),
            ],
        });
    }

    info(message: string, meta: MetaDTO) {
        process.env.DEBUG === "on" ? Logger.log(message, meta) : null;
        this.logger.info(message, meta);
    }

    error(message: string, meta: MetaDTO) {
        process.env.DEBUG === "on" ? Logger.error(message, meta?.trace, meta) : null;
        this.logger.error(message, meta);
    }

    warn(message: string, meta: MetaDTO) {
        process.env.DEBUG === "on" ? Logger.warn(message, meta) : null;
        this.logger.warn(message, meta);
    }

}