import { CommonService } from '@common/service/common.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  constructor(private commonService: CommonService) {}
  getHello(): string {
    return this.commonService.encrypt('I1:]_!1M_=bk&a9GJ671', 'appSecret');
  }
}
