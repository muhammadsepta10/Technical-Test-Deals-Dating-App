import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { PermitDocument } from './permit-document.entity';

@Injectable()
export class PermitDocumentRepository extends Repository<PermitDocument> {
  constructor(private dataSource: DataSource) {
    super(PermitDocument, dataSource.createEntityManager());
  }
}
