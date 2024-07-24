import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { NewsVerificationHistory } from './news-verification-history.entity';

@Injectable()
export class NewsVerificationHistoryRepository extends Repository<NewsVerificationHistory> {
  constructor(private dataSource: DataSource) {
    super(NewsVerificationHistory, dataSource.createEntityManager());
  }
}
