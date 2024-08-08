import { Module } from '@nestjs/common';
import { GuestBookService } from './guest-book.service';
import { GuestBookController } from './guest-book.controller';
import { GuestBookDbModule } from 'src/db/project-db/entity/guest-book/guest-book.module';
import { CommonModule } from '@common/service/common.module';
import { LoginSessionDbModule } from 'src/db/project-db/entity/login-session/login-session.module';
import { MasterInstanceCategoryDbModule } from 'src/db/project-db/entity/master-instance-category/master-instance-category.module';
import { MasterWorkUnitDbModule } from 'src/db/project-db/entity/master-work-unit/master-work-unit.module';
import { AppConfigModule } from '@common/config/api/config.module';
import { MailerModule } from '../mailer/mailer.module';
import { MasterModule } from '../master/master.module';

@Module({
  providers: [GuestBookService],
  controllers: [GuestBookController],
  imports: [
    GuestBookDbModule,
    CommonModule,
    LoginSessionDbModule,
    MasterInstanceCategoryDbModule,
    MasterWorkUnitDbModule,
    AppConfigModule,
    MailerModule,
    MasterModule
  ]
})
export class GuestBookModule {}
