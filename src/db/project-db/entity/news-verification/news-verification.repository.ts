import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { NewsVerification } from './news-verification.entity';

@Injectable()
export class NewsVerificationRepository extends Repository<NewsVerification> {
  constructor(private dataSource: DataSource) {
    super(NewsVerification, dataSource.createEntityManager());
  }
}
