import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { GuestBook } from './guest-book.entity';

@Injectable()
export class GuestBookRepository extends Repository<GuestBook> {
  constructor(private dataSource: DataSource) {
    super(GuestBook, dataSource.createEntityManager());
  }
}
