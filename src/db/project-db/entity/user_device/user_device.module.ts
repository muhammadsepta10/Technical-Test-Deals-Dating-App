import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserDevice } from './user_device.entity';
import { UserDeviceRepository } from './user_device.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserDevice])],
  exports: [TypeOrmModule, UserDeviceRepository],
  providers: [UserDeviceRepository]
})
export class UserDeviceDbModule {}
