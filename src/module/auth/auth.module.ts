import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CommonModule } from '@common/service/common.module';
import { LoginSessionDbModule } from 'src/db/project-db/entity/login-session/login-session.module';
import { UserDbModule } from 'src/db/project-db/entity/user/user.module';
import { MasterAccessDbModule } from 'src/db/project-db/entity/master-access/master-access.module';
import { MasterAppDbModule } from 'src/db/project-db/entity/master-app/master-app.module';
import { UserAccessDbModule } from 'src/db/project-db/entity/user-access/user-access.module';
import { ProjectDbConfigModule } from '@common/config/db/project-db/config.module';
import { AppConfigModule } from '@common/config/api/config.module';
import { UserDeviceDbModule } from 'src/db/project-db/entity/user_device/user_device.module';
import { DeviceDbModule } from 'src/db/project-db/entity/device/device.module';

@Module({
  imports: [
    MasterAccessDbModule,
    CommonModule,
    LoginSessionDbModule,
    UserDbModule,
    MasterAppDbModule,
    UserAccessDbModule,
    ProjectDbConfigModule,
    AppConfigModule,
    UserDeviceDbModule,
    DeviceDbModule
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService]
})
export class AuthModule {}
