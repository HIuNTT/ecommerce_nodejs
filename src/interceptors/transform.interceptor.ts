import { CallHandler, ExecutionContext, HttpStatus, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { map, Observable } from 'rxjs';
import { BYPASS_KEY } from '~/decorators/bypass.decorator';
import { Request, Response } from 'express';

import qs from 'qs';
import { ResOp } from '~/helpers/response.helper';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
    constructor(private readonly reflector: Reflector) {}
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
        const bypass = this.reflector.get<boolean>(BYPASS_KEY, context.getHandler());
        if (bypass) {
            return next.handle();
        }

        const http = context.switchToHttp();
        const request = http.getRequest<Request>();
        const response = http.getResponse<Response>();

        // Xử lý các tham số Query, chuyển các tham số mảng thành mảng: ?a[]=1&a[]=2 => { a: [1, 2] } => kết quả cuối cùng là 1 object chứa các tham số query
        request.query = qs.parse(request.url.split('?').at(1));

        return next.handle().pipe(
            map((data) => {
                return new ResOp(HttpStatus.OK, data ?? null);
            }),
        );
    }
}
