import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {RequestEntity} from './request.entity';
import {RequestRepository} from './request.repository';

@Module({
    imports: [TypeOrmModule.forFeature([RequestEntity])],
    providers: [RequestRepository],
    exports: [TypeOrmModule, RequestRepository],

})
export class RequestDbModule { }