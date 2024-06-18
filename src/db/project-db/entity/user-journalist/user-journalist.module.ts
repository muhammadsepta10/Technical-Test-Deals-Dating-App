import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserJournalist } from './user-journalist.entity';
import { UserJournalistRepository } from './user-journalist.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserJournalist])],
  exports: [TypeOrmModule, UserJournalistRepository],
  providers: [UserJournalistRepository]
})
export class UserJournalistModule {}
