import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAccess } from './user-access.entity';
import { UserAccessRepository } from './user-access.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserAccess])],
  exports: [TypeOrmModule, UserAccessRepository],
  providers: [UserAccessRepository]
})
export class UserAccessDbModule {}
