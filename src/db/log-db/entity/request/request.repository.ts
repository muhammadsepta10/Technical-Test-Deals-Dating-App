import {Injectable} from '@nestjs/common';
import {Repository} from 'typeorm';
import {RequestEntity} from './request.entity';

@Injectable()
export class RequestRepository extends Repository<RequestEntity> {

}
