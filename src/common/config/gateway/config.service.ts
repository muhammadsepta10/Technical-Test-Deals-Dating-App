import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';

@Injectable()
export class GatewayConfigService {
    constructor(private configService: ConfigService) {
    }

    get MAIL_USER(): string {
        return this.configService.get<string>("gw.MAIL_USER")
    }
    get MAIL_PASS(): string {
        return this.configService.get<string>("gw.MAIL_PASS")
    }
}
