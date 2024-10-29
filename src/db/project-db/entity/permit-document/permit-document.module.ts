import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermitDocument } from './permit-document.entity';
import { PermitDocumentRepository } from './permit-document.repository';

@Module({
  imports: [TypeOrmModule.forFeature([PermitDocument])],
  exports: [TypeOrmModule, PermitDocumentRepository],
  providers: [PermitDocumentRepository]
})
export class PermitDocumentDbModule {}
