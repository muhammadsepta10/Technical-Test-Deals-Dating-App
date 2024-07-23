import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { CommonModule } from '@common/service/common.module';
import { UserModule } from '../user/user.module';
import { LoginSessionDbModule } from 'src/db/project-db/entity/login-session/login-session.module';
import { UserJournalistModule } from 'src/db/project-db/entity/user-journalist/user-journalist.module';
import { UserDbModule } from 'src/db/project-db/entity/user/user.module';
import { UserAccessDbModule } from 'src/db/project-db/entity/user-access/user-access.module';
import { UserJournalistDocModule } from 'src/db/project-db/entity/user-journalist-doc/user-journalist-doc.module';
import { MasterInvalidReasonModule } from 'src/db/project-db/entity/master-invalid-reason/master-invalid-reason.module';
import { JournalistVerificationCodeDbModule } from 'src/db/project-db/entity/journalist-verification-code/journalist-verification-code.module';
import { ProjectDbConfigModule } from '@common/config/db/project-db/config.module';

@Module({
  imports: [
    CommonModule,
    UserModule,
    LoginSessionDbModule,
    UserJournalistModule,
    UserDbModule,
    UserAccessDbModule,
    UserJournalistDocModule,
    MasterInvalidReasonModule,
    JournalistVerificationCodeDbModule,
    ProjectDbConfigModule
  ],
  providers: [MediaService],
  controllers: [MediaController]
})
export class MediaModule {}
