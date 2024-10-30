import {Injectable} from '@nestjs/common';
import {Repository, DataSource} from 'typeorm';
import {GeneralParameter} from './general-parameter.entity';

@Injectable()
export class GeneralParameterRepository extends Repository<GeneralParameter> {
    constructor(private dataSource: DataSource) {
        super(GeneralParameter, dataSource.createEntityManager());
    }

}
