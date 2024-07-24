import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get NODE_ENV(): string {
    return this.configService.get<string>('app.NODE_ENV') || 'development';
  }
  get APP_PORT(): string {
    return this.configService.get<string>('app.APP_PORT');
  }
  get APP_VERSION(): string {
    return this.configService.get<string>('app.APP_VERSION');
  }
  get NAME_PROGRAM(): string {
    return this.configService.get<string>('app.NAME_PROGRAM');
  }
  get CRYPTO_SECRET(): string {
    return this.configService.get<string>('app.CRYPTO_SECRET');
  }
  get TOKEN_FIREBASE(): string {
    return this.configService.get<string>('app.TOKEN_FIREBASE');
  }
  get BASE_URL(): string {
    return this.configService.get<string>('app.BASE_URL');
  }
  get HOST_REDIS(): string {
    return this.configService.get<string>('app.HOST_REDIS');
  }
  get MAIL_USER(): string {
    return this.configService.get<string>('app.MAIL_USER');
  }
  get MAIL_PASS(): string {
    return this.configService.get<string>('app.MAIL_PASS');
  }
}
