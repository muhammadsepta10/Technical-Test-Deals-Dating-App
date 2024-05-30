import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {ResponseEntity} from './response.entity';
import {ResponseRepository} from './response.repository';

@Module({
    imports: [TypeOrmModule.forFeature([ResponseEntity])],
    providers: [ResponseRepository],
    exports: [TypeOrmModule, ResponseRepository],

})
export class ResponseDbModule { }