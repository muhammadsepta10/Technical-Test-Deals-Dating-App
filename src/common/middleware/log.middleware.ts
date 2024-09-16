import { LoggerService } from '@common/logger/logger.service';
import { CommonService } from '@common/service/common.service';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request } from 'express';
import * as zlib from 'zlib';

@Injectable()
export class RequestLogMiddleware implements NestMiddleware {
  constructor(
    private logService: LoggerService,
    private commonService: CommonService
  ) {}
  async use(req: Request, res: any, next: (error?: any) => void) {
    const requestTime = new Date().getTime();
    const requestId = `${await this.commonService.randString(
      10,
      'QWERTYUIOPASDFGHJKLZXCVBNM!@#$%^&*()0987654321',
      ''
    )}${new Date().getTime()}`;
    this.logService.info(`Request API ${req.params[0]}`, {
      path: req.params[0],
      uniqueId: requestId,
      context: 'Request',
      body: zlib.deflateSync(JSON.stringify(req?.body)).toString('base64'),
      query: JSON.stringify(req.query),
      header: JSON.stringify({
        authorization: req.headers.authorization,
        userAgent: req.headers['user-agent']
      }),
      ip: (req.headers['x-forwarded-for'] || req.socket.remoteAddress)?.toString(),
      currentTime: requestTime
    });
    req['requestId'] = requestId;
    req['requestTime'] = requestTime;
    next();
  }
}
