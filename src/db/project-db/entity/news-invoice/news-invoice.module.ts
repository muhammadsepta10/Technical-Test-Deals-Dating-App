import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsInvoice } from './news-invoice.entity';
import { NewsInvoiceRepository } from './news-invoice.repository';

@Module({
  imports: [TypeOrmModule.forFeature([NewsInvoice])],
  exports: [TypeOrmModule, NewsInvoiceRepository],
  providers: [NewsInvoiceRepository]
})
export class NewsInvoiceDbModule {}
