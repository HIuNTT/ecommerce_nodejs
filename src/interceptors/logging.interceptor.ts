import { CallHandler, ExecutionContext, Logger, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';

export class LoggingInterceptor implements NestInterceptor {
    private logger = new Logger(LoggingInterceptor.name, { timestamp: false });
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        const call$ = next.handle();
        const request = context.switchToHttp().getRequest();
        const content = `${request.method} -> ${request.url}`;
        const isSse = request.headers.accept === 'text/event-stream'; // Sse is Server sent events, realtime 1 chiều, từ server gửi đi
        this.logger.debug(`+++ Request: ${content}`);
        const now = Date.now();

        return call$.pipe(
            tap(() => {
                if (isSse) {
                    return;
                }

                this.logger.debug(`--- Response: ${content} + ${Date.now() - now}ms`);
            }),
        );
    }
}
