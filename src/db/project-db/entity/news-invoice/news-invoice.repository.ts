import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { NewsInvoice } from './news-invoice.entity';

@Injectable()
export class NewsInvoiceRepository extends Repository<NewsInvoice> {
  constructor(private dataSource: DataSource) {
    super(NewsInvoice, dataSource.createEntityManager());
  }
}
