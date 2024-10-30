import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {GeneralParameter} from './general-parameter.entity';
import {GeneralParameterRepository} from './general-parameter.repository';

@Module({
    imports: [TypeOrmModule.forFeature([GeneralParameter])],
    exports: [TypeOrmModule, GeneralParameterRepository],
    providers: [GeneralParameterRepository],
})
export class GeneralParameterDbModule { }
