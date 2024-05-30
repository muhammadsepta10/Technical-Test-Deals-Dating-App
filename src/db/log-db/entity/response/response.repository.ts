import {Injectable} from '@nestjs/common';
import {Repository, DataSource} from 'typeorm';
import {ResponseEntity} from './response.entity';

@Injectable()
export class ResponseRepository extends Repository<ResponseEntity> {

    async testFind(id): Promise<ResponseEntity> {
        return this.findOneBy({_id: id})
    }
}
