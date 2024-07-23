import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { JournalistVerificationCode } from './journalist-verification-code.entity';

@Injectable()
export class JournalistVerificationCodeRepository extends Repository<JournalistVerificationCode> {
  constructor(private dataSource: DataSource) {
    super(JournalistVerificationCode, dataSource.createEntityManager());
  }
}
