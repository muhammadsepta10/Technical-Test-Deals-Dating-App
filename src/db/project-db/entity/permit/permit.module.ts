import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permit } from './permit.entity';
import { PermitRepository } from './permit.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Permit])],
  exports: [TypeOrmModule, PermitRepository],
  providers: [PermitRepository]
})
export class PermitDbModule {}
