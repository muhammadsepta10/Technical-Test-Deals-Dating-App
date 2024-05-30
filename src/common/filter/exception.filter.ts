import { LoggerService } from '@common/logger/logger.service';
import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import {HttpAdapterHost} from '@nestjs/core';
import * as dayjs from 'dayjs';
import duration = require('dayjs/plugin/duration');
dayjs.extend(duration);


@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    constructor(
        private readonly httpAdapterHost: HttpAdapterHost,
        private logService: LoggerService
    ) {
    }

    async catch(exception: HttpException, host: ArgumentsHost): Promise<void> {
        // In certain situations `httpAdapter` might not be available in the
        // constructor method, thus we should resolve it here.
        const {httpAdapter} = this.httpAdapterHost;
        const ctx = host.switchToHttp();
        const request = ctx.getRequest()
        const requestId = request["requestId"]
        const path = request["path"]
        let responseTime = dayjs.duration(((new Date().getTime()) - request["requestTime"]) || 0)
        const hRpns = responseTime.asHours()
        const mRpns = responseTime.asMinutes()
        const sRpns = responseTime.asSeconds()
        const msRpns = responseTime.asMilliseconds()
        const formatResponseTime = hRpns >= 1 ? `${hRpns}h` : mRpns >= 1 ? `${mRpns}m` : sRpns >= 1 ? `${sRpns}s` : msRpns >= 1 ? `${msRpns}ms` : '0'
        const httpStatus =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;
        let response: any = exception?.getResponse ? exception?.getResponse() : null
        if (httpStatus >= 500) {
            this.logService.error(`ERROR API ${exception.stack}`, {
                path,
                trace: exception.stack,
                refId: requestId,
                responseTime: formatResponseTime,
                context: JSON.stringify(exception),
                body: JSON.stringify(exception)

            })
        }
        if (httpStatus < 500) {
            this.logService.warn(`${response.message}`, {
                path,
                trace: response?.message,
                refId: requestId,
                context: "bad request",
                responseTime: formatResponseTime
            })
        }
        if (response && typeof response === "object" && !response?.data?.message) {
            response.data = {}
            response.data.message = response.message
        }
        const responseBody = exception instanceof HttpException ? response : {
            statusCode: httpStatus,
            message: "Internal server error!!",
            data: {
                timestamp: new Date().toISOString(),
                path: httpAdapter.getRequestUrl(ctx.getRequest()),
                message: "Internal server error!!"
            }
        };
        // const responseTime = (new Date().getTime()) - request["requestTime"]
        // const requestId = request["requestId"]
        httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
    }
}