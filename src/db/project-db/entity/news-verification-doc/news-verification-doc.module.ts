import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsVerificationDoc } from './news-verification-doc.entity';
import { NewsVerificationDocRepository } from './news-verification-doc.repository';

@Module({
  imports: [TypeOrmModule.forFeature([NewsVerificationDoc])],
  exports: [TypeOrmModule, NewsVerificationDocRepository],
  providers: [NewsVerificationDocRepository]
})
export class NewsVerificationDocModule {}
