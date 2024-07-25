import { INestApplication, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
    extends PrismaClient<Prisma.PrismaClientOptions, 'query' | 'error'>
    implements OnModuleInit, OnModuleDestroy
{
    private readonly logger = new Logger(PrismaService.name);

    constructor(config: ConfigService) {
        super({
            datasources: {
                db: {
                    url: config.get('DATABASE_URL'),
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
        this.$on('error', (event) => {
            this.logger.verbose(event.target);
        });
        this.$on('query', (event: Prisma.QueryEvent) => {
            this.logger.verbose('Query: ' + event.query);
            this.logger.verbose('Duration: ' + event.duration + 'ms');
            this.logger.verbose('Param: ' + event.params);
        });
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
