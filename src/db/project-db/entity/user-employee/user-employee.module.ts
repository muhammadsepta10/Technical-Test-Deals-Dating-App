import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEmployee } from './user-employee.entity';
import { UserEmployeeRepository } from './user-employee.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserEmployee])],
  exports: [TypeOrmModule, UserEmployeeRepository],
  providers: [UserEmployeeRepository]
})
export class UserEmployeeModule {}
