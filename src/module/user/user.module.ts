import { Module } from '@nestjs/common';
import { CommonModule } from '@common/service/common.module';
import { AppConfigModule } from '@common/config/api/config.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { LoginSessionDbModule } from 'src/db/project-db/entity/login-session/login-session.module';
import { UserDbModule } from 'src/db/project-db/entity/user/user.module';
import { MasterAccessDbModule } from 'src/db/project-db/entity/master-access/master-access.module';
import { UserAccessDbModule } from 'src/db/project-db/entity/user-access/user-access.module';
import { MasterAppDbModule } from 'src/db/project-db/entity/master-app/master-app.module';
import { ProjectDbConfigModule } from '@common/config/db/project-db/config.module';

@Module({
  imports: [
    CommonModule,
    AppConfigModule,
    LoginSessionDbModule,
    UserDbModule,
    MasterAccessDbModule,
    UserAccessDbModule,
    MasterAppDbModule,
    ProjectDbConfigModule
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}
