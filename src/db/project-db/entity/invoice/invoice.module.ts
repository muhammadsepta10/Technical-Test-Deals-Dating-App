import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from './invoice.entity';
import { InvoiceRepository } from './invoice.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice])],
  exports: [TypeOrmModule, InvoiceRepository],
  providers: [InvoiceRepository]
})
export class InvoiceDbModule {}
