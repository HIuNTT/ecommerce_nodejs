import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '~/shared/prisma/prisma.service';
import {
    CreateFlashSaleDTO,
    FlashSaleQueryDTO,
    GetFlashSaleDetailDTO,
    GetFlashSaleDTO,
    UpdateFlashSaleDTO,
} from './dto/flash-sale.dto';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import utc from 'dayjs/plugin/utc';

import { FLASHSALE_STATUS } from '~/enums/status.enum';
import { Order } from '~/interfaces/pager.dto';
import { createPagination } from '~/helpers/paginate/create-pagination';
import { Pagination } from '~/helpers/paginate/pagination';
import { GetItemFlashSaleDTO, ItemFlashSaleQueryDTO } from './dto/flash-sale-item.dto';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(utc);

@Injectable()
export class FlashSaleService {
    constructor(private readonly prisma: PrismaService) {}

    // Lấy ra các flash sale đang diễn ra và sắp diễn ra gần với thời gian hiện tại nhất, mặc định 5 cái gần nhất
    async getFlashSales(filters: FlashSaleQueryDTO): Promise<Pagination<GetFlashSaleDTO>> {
        const { limit, page, sortBy = 'startTime', order = Order.DESC, actived, status } = filters;
        const [flashSales, totalCount] = await Promise.all([
            this.prisma.flashSale.findMany({
                where: {
                    ...(status === FLASHSALE_STATUS.UPCOMING && {
                        startTime: { gt: dayjs().toISOString() },
                    }),
                    ...(status === FLASHSALE_STATUS.ONGOING && {
                        startTime: { lte: dayjs().toISOString() },
                        endTime: { gte: dayjs().toISOString() },
                    }),
                    ...(status === FLASHSALE_STATUS.ENDED && {
                        endTime: { lt: dayjs().toISOString() },
                    }),
                    isActived: actived,
                },
                orderBy: {
                    ...(sortBy && { [sortBy]: order }),
                },
                take: limit,
                skip: filters.skip,
                include: {
                    _count: {
                        select: {
                            items: true,
                        },
                    },
                },
            }),
            this.prisma.flashSale.count({
                where: {
                    ...(status === FLASHSALE_STATUS.UPCOMING && {
                        startTime: { gt: dayjs().toISOString() },
                    }),
                    ...(status === FLASHSALE_STATUS.ONGOING && {
                        startTime: { lte: dayjs().toISOString() },
                        endTime: { gte: dayjs().toISOString() },
                    }),
                    ...(status === FLASHSALE_STATUS.ENDED && {
                        endTime: { lt: dayjs().toISOString() },
                    }),
                    isActived: actived,
                },
            }),
        ]);

        if (!flashSales) {
            throw new BadRequestException('No flash sales found');
        }

        return createPagination<GetFlashSaleDTO>({
            items: flashSales,
            totalCount,
            currentPage: page,
            limit,
        });
    }

    // Lấy ra danh sách các items thuộc flash sale có id là flashSaleId (đang diễn ra or sắp diễn ra)
    async getItemsByFlashSaleId(
        filters: ItemFlashSaleQueryDTO,
        flashSaleId: number,
    ): Promise<Pagination<GetItemFlashSaleDTO>> {
        const { limit, categoryId, page } = filters;

        // Kiểm tra xem có flash sale nào đang diễn ra hoặc sắp diễn ra không?
        const flashSale = await this.prisma.flashSale.findUnique({
            where: {
                id: flashSaleId,
                AND: {
                    OR: [
                        {
                            startTime: { gt: dayjs().toISOString() },
                        },
                        {
                            startTime: { lte: dayjs().toISOString() },
                            endTime: { gte: dayjs().toISOString() },
                        },
                    ],
                },
            },
        });

        if (!flashSale) {
            throw new BadRequestException('Flash sale not found');
        }

        const [flashSaleItem, totalCount] = await Promise.all([
            this.prisma.item.findMany({
                where: {
                    isActived: true,
                    flashSales: {
                        some: {
                            flashSaleId,
                        },
                    },
                    ...(categoryId && { categories: { some: { categoryId } } }),
                },
                skip: filters.skip,
                take: limit,
                include: {
                    flashSales: {
                        where: {
                            flashSaleId,
                        },
                        select: {
                            sold: true,
                            slot: true,
                            discountedPrice: true,
                            discountPercentage: true,
                            quantity: true,
                            flashSaleId: true,
                        },
                    },
                },
            }),
            this.prisma.item.count({
                where: {
                    isActived: true,
                    flashSales: {
                        some: {
                            flashSaleId,
                        },
                    },
                    ...(categoryId && { categories: { some: { categoryId } } }),
                },
            }),
        ]);
        return createPagination<GetItemFlashSaleDTO>({
            items: flashSaleItem,
            totalCount,
            currentPage: page,
            limit,
        });
    }

    async getFlashSaleDetail(flashSaleId: number): Promise<GetFlashSaleDetailDTO> {
        const flashSale = await this.prisma.flashSale.findUnique({
            where: {
                id: flashSaleId,
            },
            include: {
                items: {
                    omit: {
                        createdAt: true,
                        updatedAt: true,
                        flashSaleId: true,
                        sold: true,
                    },
                    include: {
                        item: {
                            select: {
                                name: true,
                                thumbnail: true,
                            },
                        },
                    },
                },
            },
        });

        if (!flashSale) {
            throw new BadRequestException('Flash sale not found');
        }

        return flashSale;
    }

    async createFlashSale(body: CreateFlashSaleDTO): Promise<void> {
        const { items, startTime, endTime, ...flashSaleData } = body;

        await this.prisma.flashSale.create({
            data: {
                startTime: dayjs(startTime).subtract(7, 'hours').toISOString(),
                endTime: dayjs(endTime).subtract(7, 'hours').toISOString(),
                ...flashSaleData,
                items: {
                    create: items.map((item, index) => ({
                        ...item,
                        slot: item.slot || index + 1,
                    })),
                },
            },
        });
    }

    async updateFlashSale(body: UpdateFlashSaleDTO): Promise<void> {
        const { items, startTime, endTime, id, name } = body;

        const flashSale = await this.prisma.flashSale.findUnique({
            where: {
                id: body.id,
            },
        });

        if (dayjs().isAfter(flashSale.endTime)) {
            throw new BadRequestException('Cannot update an ended flash sale');
        }

        if (dayjs().isSameOrAfter(flashSale.startTime) && dayjs().isSameOrBefore(flashSale.endTime)) {
            throw new BadRequestException('Cannot update an ongoing flash sale');
        }

        await this.prisma.flashSale.update({
            where: {
                id,
            },
            data: {
                name,
                startTime: dayjs(startTime).subtract(7, 'hours').toISOString(),
                endTime: dayjs(endTime).subtract(7, 'hours').toISOString(),
                items: {
                    deleteMany: {},
                    create: items.map((item, index) => ({
                        ...item,
                        slot: item.slot || index + 1,
                    })),
                },
            },
        });
    }

    async deleteFlashSale(flashSaleId: number): Promise<void> {
        const flashSale = await this.prisma.flashSale.findUnique({
            where: {
                id: flashSaleId,
            },
        });

        if (
            (dayjs().isSameOrAfter(flashSale.startTime) && dayjs().isSameOrBefore(flashSale.endTime)) ||
            dayjs().isAfter(flashSale.endTime)
        ) {
            throw new BadRequestException('Cannot delete an ongoing or ended flash sale');
        }

        await this.prisma.flashSale.delete({
            where: {
                id: flashSaleId,
            },
        });
    }

    // Dùng cho schedule
    async findUpcomingFlashSale(time: number) {
        console.log(dayjs());
        console.log(new Date());
        console.log(dayjs('2019-01-25').format('[YYYYescape] YYYY-MM-DDTHH:mm:ssZ[Z]'));
        console.log(dayjs('2024-08-04 23:59:59').toDate());
        console.log(dayjs().add(time, 'minutes').second(0).millisecond(0).toDate());
        return this.prisma.flashSale.findFirst({
            where: {
                startTime: { equals: dayjs().add(time, 'minutes').second(0).millisecond(0).toDate() },
                isActived: true,
            },
            orderBy: {
                startTime: 'asc',
            },
            select: {
                id: true,
                startTime: true,
                endTime: true,
            },
        });
    }
}
