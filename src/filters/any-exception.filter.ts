import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { IBaseResponse } from '~/interfaces';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    constructor() {
        this.registerCatchAllExceptionsHook();
    }

    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const request = ctx.getRequest<Request>();
        const response = ctx.getResponse<Response>();

        const url = request.url!;

        const status = this.getStatus(exception);
        const message = this.getErrorMessage(exception);

        if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
            Logger.error(exception, undefined, 'Catch');
        } else {
            this.logger.warn(`Error: (${status}) ${message} Path: ${decodeURI(url)}`);
        }

        const resBody: IBaseResponse = {
            statusCode: status,
            message,
            data: null,
        };

        response.status(status).send(resBody);
    }

    getStatus(exception: any): number {
        if (exception instanceof HttpException) {
            return exception.getStatus();
        } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
            switch (exception.code) {
                case 'P2000':
                    return HttpStatus.BAD_REQUEST;
                case 'P2002':
                    return HttpStatus.CONFLICT;
                case 'P2003':
                    return HttpStatus.BAD_REQUEST;
                case 'P2025':
                    return HttpStatus.NOT_FOUND;
                default:
                    return HttpStatus.INTERNAL_SERVER_ERROR;
            }
        } else {
            return HttpStatus.INTERNAL_SERVER_ERROR;
        }
    }

    getErrorMessage(exception: any): string {
        if (exception instanceof HttpException) {
            return exception.message;
        } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
            return exception.message.replace(/\n/g, '');
        } else {
            return (exception as any)?.response?.message ?? `${exception}`;
        }
    }

    registerCatchAllExceptionsHook() {
        process.on('uncaughtException', (err) => {
            Logger.error(err, undefined, 'UncaughtException');
        });

        process.on('unhandledRejection', (reason) => {
            Logger.error(reason, undefined, 'UnhandledRejection');
        });
    }
}
