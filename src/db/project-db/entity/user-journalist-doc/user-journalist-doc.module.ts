import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserJournalistDoc } from './user-journalist-doc.entity';
import { UserJournalistDocRepository } from './user-journalist-doc.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserJournalistDoc])],
  exports: [TypeOrmModule, UserJournalistDocRepository],
  providers: [UserJournalistDocRepository]
})
export class UserJournalistDocModule {}
