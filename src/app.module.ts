import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestLogMiddleware } from '@common/middleware/log.middleware';
import { ProjectDbConfigModule } from '@common/config/db/project-db/config.module';
import { ProjectDbConfigService } from '@common/config/db/project-db/config.service';
import { DataSource } from 'typeorm';
import { LogDBConfigModule } from '@common/config/db/log-db/config.module';
import { LogDBConfigService } from '@common/config/db/log-db/config.service';
import { resolve } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { path as appRoot } from 'app-root-path';
import { RequestDbModule } from './db/log-db/entity/request/request.module';
import { LoggerModule } from '@common/logger/logger.module';
import { AppConfigModule } from '@common/config/api/config.module';
import { CommonModule } from '@common/service/common.module';
import { CacheModule } from './module/cache/cache.module';
import { AuthModule } from './module/auth/auth.module';
import { UserModule } from './module/user/user.module';
import { MediaModule } from './module/media/media.module';
import { MasterModule } from './module/master/master.module';
import { MailerModule } from './module/mailer/mailer.module';
import { BullModule } from '@nestjs/bull';
import { AppConfigService } from '@common/config/api/config.service';
import { GuestBookModule } from './module/guest-book/guest-book.module';
import { MeetingModule } from './module/meeting/meeting.module';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => {
        return {
          redis: {
            host: config.HOST_REDIS,
            port: 6379
          }
        };
      }
    }),
    TypeOrmModule.forRootAsync({
      imports: [ProjectDbConfigModule],
      inject: [ProjectDbConfigService],
      // Use useFactory, useClass, or useExisting
      // to configure the DataSourceOptions.
      useFactory: (config: ProjectDbConfigService) => config.typeORMConfig(),
      // dataSource receives the configured DataSourceOptions
      // and returns a Promise<DataSource>.
      dataSourceFactory: async options => {
        const dataSource = await new DataSource(options).initialize();
        return dataSource;
      }
    }),
    TypeOrmModule.forRootAsync({
      imports: [LogDBConfigModule],
      inject: [LogDBConfigService],
      useFactory: (config: LogDBConfigService) => config.typeORMConfig(),
      dataSourceFactory: async options => {
        const dataSource = await new DataSource(options).initialize();
        return dataSource;
      }
    }),
    ServeStaticModule.forRoot({
      rootPath: resolve(`${appRoot}/../public`)
    }),
    RequestDbModule,
    LoggerModule,
    AppConfigModule,
    CommonModule,
    CacheModule,
    AuthModule,
    UserModule,
    MediaModule,
    MasterModule,
    MailerModule,
    GuestBookModule,
    MeetingModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLogMiddleware).forRoutes('*');
  }
}
