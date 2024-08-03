import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { extendedPrisma } from './prisma.extension';

@Global()
@Module({
    providers: [
        {
            provide: PrismaService,
            useFactory: () => {
                return extendedPrisma;
            },
        },
    ],
    exports: [PrismaService],
})
export class PrismaModule {}
