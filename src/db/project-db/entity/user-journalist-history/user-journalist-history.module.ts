import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserJournalistHistory } from './user-journalist-history.entity';
import { UserJournalistHistoryRepository } from './user-journalist-history.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserJournalistHistory])],
  exports: [TypeOrmModule, UserJournalistHistoryRepository],
  providers: [UserJournalistHistoryRepository]
})
export class UserJournalistHistoryModule {}
