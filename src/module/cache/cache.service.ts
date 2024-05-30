import {AppConfigService} from '@common/config/api/config.service';
import {Injectable} from '@nestjs/common';
import {Redis} from 'ioredis';

@Injectable()
export class CacheService {
    private readonly redisClient: Redis;
    constructor(private appConfigService: AppConfigService) {
        this.redisClient = new Redis({
            host: this.appConfigService.HOST_REDIS,
            connectTimeout: 100000
        })
    }

    async get(cacheKey: string) {
        return this.appConfigService.NODE_ENV === "development" ? null : this.redisClient.get(cacheKey);
    }

    async set(cacheKey: string, data: string, expired: number) {
        this.appConfigService.NODE_ENV === "development" ? null : await this.redisClient.set(cacheKey, data, 'EX', expired);
    }
}
