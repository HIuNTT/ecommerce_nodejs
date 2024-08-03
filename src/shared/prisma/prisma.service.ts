import { INestApplication, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import dayjs from 'dayjs';
import { FLASHSALE_STATUS } from '~/enums/status.enum';
import { env } from '~/global/env';

@Injectable()
export class PrismaService
    extends PrismaClient<Prisma.PrismaClientOptions, 'query' | 'error'>
    implements OnModuleInit, OnModuleDestroy
{
    private readonly logger = new Logger(PrismaService.name);

    constructor() {
        super({
            datasources: {
                db: {
                    url: env('DATABASE_URL'),
                },
            },
            log: [
                {
                    emit: 'event',
                    level: 'query',
                },
                {
                    emit: 'event',
                    level: 'error',
                },
                {
                    emit: 'stdout',
                    level: 'info',
                },
                {
                    emit: 'stdout',
                    level: 'warn',
                },
            ],
        });
    }

    async onModuleInit() {
        // this.$on('error', (event) => {
        //     this.logger.verbose(event.target);
        // });
        // this.$on('query', (event: Prisma.QueryEvent) => {
        //     this.logger.verbose('Query: ' + event.query);
        //     this.logger.verbose('Duration: ' + event.duration + 'ms');
        //     this.logger.verbose('Param: ' + event.params);
        // });
        await this.$connect();
    }

    // statusExtension() {
    //     return this.$extends({
    //         result: {
    //             flashSale: {
    //                 status: {
    //                     needs: { startTime: true, endTime: true },
    //                     compute(flashSale) {
    //                         if (dayjs().isBefore(flashSale.startTime)) return FLASHSALE_STATUS.UPCOMING;
    //                         if (dayjs().isAfter(flashSale.endTime)) return FLASHSALE_STATUS.ENDED;
    //                         return FLASHSALE_STATUS.ONGOING;
    //                     },
    //                 },
    //             },
    //         },
    //     });
    // }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
