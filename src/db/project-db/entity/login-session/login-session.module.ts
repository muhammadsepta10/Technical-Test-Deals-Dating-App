import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoginSession } from './login-session.entity';
import { LoginSessionRepository } from './login-session.repository';

@Module({
  imports: [TypeOrmModule.forFeature([LoginSession])],
  exports: [TypeOrmModule, LoginSessionRepository],
  providers: [LoginSessionRepository]
})
export class LoginSessionDbModule {}
