import { Module } from '@nestjs/common';
import { MasterService } from './master.service';
import { MasterController } from './master.controller';
import { MasterAccessDbModule } from 'src/db/project-db/entity/master-access/master-access.module';
import { MasterAppDbModule } from 'src/db/project-db/entity/master-app/master-app.module';
import { MasterMediaDbModule } from 'src/db/project-db/entity/master-media/master-media.module';
import { MasterMenuDbModule } from 'src/db/project-db/entity/master-menu/master-menu.module';
import { CacheModule } from '../cache/cache.module';
import { CommonModule } from '@common/service/common.module';
import { UserDbModule } from '../../db/project-db/entity/user/user.module';
import { LoginSessionDbModule } from 'src/db/project-db/entity/login-session/login-session.module';
import { MasterScriptDbModule } from 'src/db/project-db/entity/master-script/master-script.module';
import { MasterCabangDbModule } from 'src/db/project-db/entity/master-cabang/master-cabang.module';
// import { ShiftDbModule } from "src/db/project-db/entity/shift/shift.module";

@Module({
  providers: [MasterService],
  controllers: [MasterController],
  imports: [
    MasterAccessDbModule,
    MasterAppDbModule,
    MasterMediaDbModule,
    MasterMenuDbModule,
    CacheModule,
    CommonModule,
    UserDbModule,
    LoginSessionDbModule,
    MasterScriptDbModule,
    MasterCabangDbModule
  ],
  exports: [MasterService]
})
export class MasterModule {}
