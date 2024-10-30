import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessDet } from './access-det.entity';
import { AccessDetRepository } from './access-det.repository';

@Module({
  imports: [TypeOrmModule.forFeature([AccessDet])],
  exports: [TypeOrmModule, AccessDetRepository],
  providers: [AccessDetRepository]
})
export class AccessDetDbModule {}
