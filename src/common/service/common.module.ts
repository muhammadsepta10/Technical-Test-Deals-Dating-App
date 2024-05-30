
import {Module} from '@nestjs/common';
import {CommonService} from './common.service';
import {GeneralParameterDbModule} from 'src/db/project-db/entity/general-parameter/general-parameter.module';
import {AppConfigModule} from '@common/config/api/config.module';
import { CacheModule } from 'src/module/cache/cache.module';

@Module({
    imports: [GeneralParameterDbModule, AppConfigModule, CacheModule],
    providers: [CommonService],
    exports: [CommonService]
})
export class CommonModule { }
