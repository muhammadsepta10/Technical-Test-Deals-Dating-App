import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Device } from './device.entity';
import { DeviceRepository } from './device.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Device])],
  exports: [TypeOrmModule, DeviceRepository],
  providers: [DeviceRepository]
})
export class DeviceDbModule {}
