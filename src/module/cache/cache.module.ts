import {Module} from '@nestjs/common';
import {CommonModule} from '@common/service/common.module';
import {CacheService} from './cache.service';
import {AppConfigModule} from '@common/config/api/config.module';

@Module({
    imports: [AppConfigModule],
    controllers: [],
    providers: [CacheService],
    exports: [CacheService]
})
export class CacheModule { }
