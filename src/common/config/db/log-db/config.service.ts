import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {join} from 'path';
import {DataSource, DataSourceOptions} from 'typeorm';
require('dotenv').config()

@Injectable()
export class LogDBConfigService {
    constructor(private configService: ConfigService) { }

    get URI() {
        return this.configService.get<any>('log-db.URL') || process.env.LOG_DB_URL
    }

    get type() {
        return this.configService.get<any>('log-db.TYPE') || process.env.LOG_DB_TYPE
    }

    typeORMConfig(): DataSourceOptions {
        return {
            type: this.type,
            url: this.URI,
            logging: false,
            synchronize: false,
            entities: [join(__dirname, '/../../../../db/log-db/entity/**/*.entity{.ts,.js}')],
            migrations: [join(__dirname + '/../../../../db/log-db/migrations/**/*{.ts,.js}')],
        };
    }
}
