import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { extendedPrisma } from './prisma.extension';

@Global()
@Module({
    providers: [
        {
            provide: PrismaService,
            useFactory: () => new PrismaService().statusExtension(),
        },
    ],
    exports: [PrismaService],
})
export class PrismaModule {}
