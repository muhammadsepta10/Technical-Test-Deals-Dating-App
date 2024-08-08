import { Module } from '@nestjs/common';
import { MasterService } from './master.service';
import { MasterController } from './master.controller';
import { MasterAccessDbModule } from 'src/db/project-db/entity/master-access/master-access.module';
import { MasterAppDbModule } from 'src/db/project-db/entity/master-app/master-app.module';
import { MasterBankModule } from 'src/db/project-db/entity/master-bank/master-bank.module';
import { MasterMediaDbModule } from 'src/db/project-db/entity/master-media/master-media.module';
import { MasterNewsCategoryModule } from 'src/db/project-db/entity/master-news-category/master-news-category.module';
import { MasterMenuDbModule } from 'src/db/project-db/entity/master-menu/master-menu.module';
import { CacheModule } from '../cache/cache.module';
import { CommonModule } from '@common/service/common.module';
import { UserModule } from '../user/user.module';
import { LoginSessionDbModule } from 'src/db/project-db/entity/login-session/login-session.module';
import { MasterInvalidReasonModule } from 'src/db/project-db/entity/master-invalid-reason/master-invalid-reason.module';
import { MasterScriptDbModule } from 'src/db/project-db/entity/master-script/master-script.module';
import { MasterWorkUnitDbModule } from 'src/db/project-db/entity/master-work-unit/master-work-unit.module';
import { MasterInstanceCategoryDbModule } from 'src/db/project-db/entity/master-instance-category/master-instance-category.module';

@Module({
  providers: [MasterService],
  controllers: [MasterController],
  imports: [
    MasterAccessDbModule,
    MasterAppDbModule,
    MasterBankModule,
    MasterMediaDbModule,
    MasterNewsCategoryModule,
    MasterMenuDbModule,
    CacheModule,
    CommonModule,
    UserModule,
    LoginSessionDbModule,
    MasterInvalidReasonModule,
    MasterScriptDbModule,
    MasterWorkUnitDbModule,
    MasterInstanceCategoryDbModule
  ],
  exports: [MasterService]
})
export class MasterModule {}
