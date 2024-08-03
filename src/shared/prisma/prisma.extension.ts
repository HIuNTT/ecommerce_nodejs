import dayjs from 'dayjs';
import { FLASHSALE_STATUS } from '~/enums/status.enum';
import { PrismaService } from './prisma.service';

export const extendedPrisma = new PrismaService().$extends({
    result: {
        flashSale: {
            status: {
                needs: { startTime: true, endTime: true },
                compute(flashSale) {
                    if (dayjs().isBefore(flashSale.startTime)) return FLASHSALE_STATUS.UPCOMING;
                    if (dayjs().isAfter(flashSale.endTime)) return FLASHSALE_STATUS.ENDED;
                    return FLASHSALE_STATUS.ONGOING;
                },
            },
        },
    },
});
