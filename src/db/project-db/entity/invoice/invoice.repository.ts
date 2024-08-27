import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { Invoice } from './invoice.entity';

@Injectable()
export class InvoiceRepository extends Repository<Invoice> {
  constructor(private dataSource: DataSource) {
    super(Invoice, dataSource.createEntityManager());
  }
}
