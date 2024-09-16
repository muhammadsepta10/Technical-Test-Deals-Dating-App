import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfigService } from './common/config/api/config.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import helmet from 'helmet';
import { AllExceptionsFilter } from './common/filter/exception.filter';
import { LoggingInterceptor } from '@common/interceptor/log.interceptor';
import { LoggerService } from '@common/logger/logger.service';
import { Queue } from 'bull';
import { BullMonitorExpress } from '@bull-monitor/express';
import { BullAdapter } from '@bull-monitor/root/dist/bull-adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: true
  });

  // CONFIG VARIABLE
  const appConfigService: AppConfigService = app.get(AppConfigService);
  const logService: LoggerService = app.get(LoggerService);
  const { APP_PORT, APP_VERSION, BASE_URL, NAME_PROGRAM, NODE_ENV } = appConfigService;

  // GLOBAL INTERCEPTOR
  app.useGlobalInterceptors(new LoggingInterceptor(logService));

  // SWAGGER CONFIG
  if (NODE_ENV?.toUpperCase() !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .addSecurity('auth', {
        name: 'Authorization',
        type: 'apiKey',
        in: 'header'
      })
      .addSecurity('appAuth', {
        name: 'app-auth',
        type: 'apiKey',
        in: 'header'
      })
      .setTitle(`${NAME_PROGRAM} API`)
      .setVersion('1.0')
      .addTag(`${NAME_PROGRAM}`)
      .setContact(NAME_PROGRAM, '', '')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs/KMZw48Aw44', app, document);
  }

  // BULL MONITOR CONFIG
  const adapters: BullAdapter[] = [];
  const queues = ['send-mail-simpeg'];
  for (let index = 0; index < queues.length; index++) {
    const queue = queues[index];
    const adapter = new BullAdapter(app.get<Queue>(`BullQueue_${queue}`));
    adapters.push(adapter);
  }

  const monitor = new BullMonitorExpress({
    queues: adapters,
    gqlIntrospection: true,
    metrics: {
      collectInterval: { hours: 1 },
      maxMetrics: 100
    }
  });
  await monitor.init();

  app.use(`/admin/queues`, monitor.router);

  // USE GENERAL MIDDLEWARE
  app.use(express.json({ limit: '500mb' }));
  app.enableCors({
    allowedHeaders: '*',
    origin: '*',
    credentials: true
  });
  app.use(helmet());

  // GLOBAL CATCH
  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost, logService));

  // LISTEN PORT AND START SERVICE
  await app.listen(APP_PORT).then(() => {
    console.log(
      `APP_PORT: ${APP_PORT}`,
      '|',
      `BASE_URL: ${BASE_URL}`,
      '|',
      `NODE_ENV: ${NODE_ENV}`,
      '|',
      `NAME_PROGRAM: ${NAME_PROGRAM}`,
      '|',
      `APP_VERSION: ${APP_VERSION}`
    );
  });
}
bootstrap();
