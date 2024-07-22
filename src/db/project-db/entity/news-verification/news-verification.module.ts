import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsVerification } from './news-verification.entity';
import { NewsVerificationRepository } from './news-verification.repository';

@Module({
  imports: [TypeOrmModule.forFeature([NewsVerification])],
  exports: [TypeOrmModule, NewsVerificationRepository],
  providers: [NewsVerificationRepository]
})
export class NewsVerificationModule {}
