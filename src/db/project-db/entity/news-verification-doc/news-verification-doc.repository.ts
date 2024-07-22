import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { NewsVerificationDoc } from './news-verification-doc.entity';

@Injectable()
export class NewsVerificationDocRepository extends Repository<NewsVerificationDoc> {
  constructor(private dataSource: DataSource) {
    super(NewsVerificationDoc, dataSource.createEntityManager());
  }
}
