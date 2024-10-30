import { LoggerService } from "@common/logger/logger.service";
import {CallHandler, ExecutionContext, NestInterceptor} from "@nestjs/common";
import {map} from "rxjs";
import * as dayjs from "dayjs"
import duration = require('dayjs/plugin/duration');
dayjs.extend(duration);

export class LoggingInterceptor implements NestInterceptor {
    constructor(
        private logService: LoggerService
    ) { }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<any> {
        let errObj = ""
        return next.handle().pipe(
            map(data => {
                const request = context.switchToHttp().getRequest()
                const response = context.switchToHttp().getResponse()
                const requestId = request["requestId"]
                const path = request["path"]
                let responseTime = dayjs.duration(((new Date().getTime()) - request["requestTime"]) || 0)
                const hRpns = responseTime.asHours()
                const mRpns = responseTime.asMinutes()
                const sRpns = responseTime.asSeconds()
                const msRpns = responseTime.asMilliseconds()
                const formatResponseTime = hRpns >= 1 ? `${hRpns}h` : mRpns >= 1 ? `${mRpns}m` : sRpns >= 1 ? `${sRpns}s` : msRpns >= 1 ? `${msRpns}ms` : '0'
                try {
                    errObj = JSON?.stringify(data) || ""
                } catch (error) {
                    errObj = "201"
                }
                this.logService.info(`Response API ${path}`, {
                    path: path,
                    refId: requestId,
                    body: JSON.stringify(data),
                    header: JSON.stringify(response.headers),
                    responseTime: formatResponseTime,
                    responseCode: response.statusCode,
                    context: "Response"
                })
                return data;
            }),
        );
    }
}