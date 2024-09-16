import { CommonService } from '@common/service/common.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  constructor(private commonService: CommonService) {}
  async getHello() {
    // return this.commonService.encrypt('I1:]_!1M_=bk&a9GJ671', 'appSecret');
    const file = await this.commonService.generateQrCode({
      content: 'https://google.com',
      style: 'classic'
    });
    return file;
  }
}
