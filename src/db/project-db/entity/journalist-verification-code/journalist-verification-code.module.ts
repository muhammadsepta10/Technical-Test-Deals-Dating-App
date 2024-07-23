import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JournalistVerificationCode } from './journalist-verification-code.entity';
import { JournalistVerificationCodeRepository } from './journalist-verification-code.repository';

@Module({
  imports: [TypeOrmModule.forFeature([JournalistVerificationCode])],
  exports: [TypeOrmModule, JournalistVerificationCodeRepository],
  providers: [JournalistVerificationCodeRepository]
})
export class JournalistVerificationCodeDbModule {}
