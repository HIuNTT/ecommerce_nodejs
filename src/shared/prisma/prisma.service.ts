import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor(config: ConfigService) {
        super({
            datasources: {
                db: {
                    url: config.get('DATABASE_URL'),
                },
            },
        });
        this.$extends({
            query: {
                item: {
                    async create({ model, args, query }) {
                        // if (model === 'Item' || model === 'Category') {
                        if (args.data && args.data.name) {
                            const slug = args.data.name.toLowerCase().trim().replace(/\s+/g, '-');
                            args.data.slug = slug;
                        }
                        // }
                        return query(args);
                    },
                    // async update({ model, args, query }) {
                    //     if (model === 'Item' || model === 'Category') {
                    //         if (args.data && args.data?.name) {
                    //             const slug = args.data?.name.toLowerCase().trim().replace(/\s+/g, '-');
                    //             args.data.slug = slug;
                    //         }
                    //     }
                    //     return query(args);
                    // },
                },
            },
        });
    }

    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
