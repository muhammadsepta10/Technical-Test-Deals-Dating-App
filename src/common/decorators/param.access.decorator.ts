import {createParamDecorator, ExecutionContext} from '@nestjs/common';

export const Access = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.accessId;
    },
);
