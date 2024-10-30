import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';
require('dotenv').config();

@Injectable()
export class ProjectDbConfigService {
  constructor(private configService: ConfigService) {}

  typeORMConfig(): DataSourceOptions {
    return {
      type: this.configService.get<any>('project-db.TYPE') || process.env.PROJECT_DB_TYPE,
      host: this.configService.get<string>('project-db.HOST') || process.env.PROJECT_DB_HOST,
      port: Number(this.configService.get<string>('project-db.PORT') || process.env.PROJECT_DB_PORT),
      username: this.configService.get<string>('project-db.USER') || process.env.PROJECT_DB_USER,
      password: this.configService.get<string>('project-db.PASS') || process.env.PROJECT_DB_PASS,
      database: this.configService.get<string>('project-db.NAME') || process.env.PROJECT_DB_NAME,
      logging: true,
      synchronize: false, // dont change to true, use migration in server to update database
      // synchronize: true, // dont change to true, use migration in server to update database
      entities: [join(__dirname + '/../../../../db/project-db/entity/**/*.entity.{ts,js}')],
      migrations: [join(__dirname + '/../../../../db/project-db/migrations/*.{ts,js}')]
    };
  }

  async dbConnection() {
    const appDataSource = new DataSource(this.typeORMConfig());
    await appDataSource.initialize();
    return appDataSource;
  }
}
