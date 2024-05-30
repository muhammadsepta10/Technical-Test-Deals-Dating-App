import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from "@nestjs/common";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";

export interface Response<T> {
    statusCode: number;
    message: string;
    data: T;
}

@Injectable()
export class TransformInterceptor<T>
    implements NestInterceptor<T, Response<T>>
{
    intercept(
        context: ExecutionContext,
        next: CallHandler
    ): Observable<Response<T>> {
        return next.handle().pipe(
            map((data: any) => {
                const message = data?.message ?
                    data.message :
                    context.switchToHttp().getResponse().statusCode < 400
                        ? "success"
                        : "error"
                if (!data) {
                    data = {}
                }
                if (typeof data !== "object") {
                    const result = data
                    data = {}
                    data.result = result
                }
                if (!data?.message) {
                    data.message = message
                }
                data?.data ? data = data.data : null
                return {
                    statusCode: context.switchToHttp().getResponse().statusCode,
                    message,
                    data,
                }
            })
        );
    }
}
