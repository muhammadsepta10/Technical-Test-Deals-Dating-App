import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsVerificationHistory } from './news-verification-history.entity';
import { NewsVerificationHistoryRepository } from './news-verification-history.repository';

@Module({
  imports: [TypeOrmModule.forFeature([NewsVerificationHistory])],
  exports: [TypeOrmModule, NewsVerificationHistoryRepository],
  providers: [NewsVerificationHistoryRepository]
})
export class NewsVerificationHistoryModule {}
