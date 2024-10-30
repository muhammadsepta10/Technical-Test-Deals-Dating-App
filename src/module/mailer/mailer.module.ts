import { Module } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { BullModule } from '@nestjs/bull';
import { AppConfigModule } from '@common/config/api/config.module';
import { SendMailProcessor } from './mailer.process';
import { MailerController } from './mailer.controller';
import { ProjectDbConfigModule } from '@common/config/db/project-db/config.module';
import { CommonModule } from '@common/service/common.module';
import { MasterModule } from '../master/master.module';

@Module({
  providers: [MailerService, SendMailProcessor],
  imports: [
    BullModule.registerQueue({
      name: 'send-mail-simpeg'
    }),
    AppConfigModule,
    MasterModule,
    ProjectDbConfigModule,
    CommonModule
  ],
  controllers: [MailerController],
  exports: [MailerService]
})
export class MailerModule {}
