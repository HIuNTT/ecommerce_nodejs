import { CallHandler, ExecutionContext, Injectable, NestInterceptor, RequestTimeoutException } from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
    constructor(private readonly time: number = 20000) {}
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> | Promise<Observable<any>> {
        // Phải gọi handle() thì route handler (controller method) mới được thực thi
        // return này thuộc phía response, interceptor sau quá trình controller, service. [controller -> service -> interceptors -> exception filters -> server response]
        return next.handle().pipe(
            timeout(this.time),
            catchError((err) => {
                if (err instanceof TimeoutError) {
                    return throwError(() => new RequestTimeoutException());
                }
                return throwError(() => err);
            }),
        );
    }
}
