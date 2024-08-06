import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuestBook } from './guest-book.entity';
import { GuestBookRepository } from './guest-book.repository';

@Module({
  imports: [TypeOrmModule.forFeature([GuestBook])],
  exports: [TypeOrmModule, GuestBookRepository],
  providers: [GuestBookRepository]
})
export class GuestBookDbModule {}
