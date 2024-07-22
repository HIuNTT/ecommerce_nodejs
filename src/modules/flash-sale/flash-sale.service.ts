import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '~/shared/prisma/prisma.service';
import { CreateFlashSaleDTO, UpdateFlashSaleDTO } from './dto/flash-sale.dto';
import dayjs from 'dayjs';
import { FLASHSALE_STATUS } from '~/enums/status.enum';
import { Filters } from '~/interfaces';
import { FlashSale } from '@prisma/client';

@Injectable()
export class FlashSaleService {
    constructor(private readonly prisma: PrismaService) {}

    // Lấy ra các flash sale đang diễn ra và sắp diễn ra gần với thời gian hiện tại nhất, mặc định 5 cái gần nhất
    async getFlashSales(
        filters: Filters,
    ): Promise<Omit<FlashSale, 'isActived' | 'createdAt' | 'updatedAt' | 'status'>[]> {
        const { limit = 5 } = filters;
        console.log(dayjs().toISOString());
        const flashSales = await this.prisma.flashSale.findMany({
            where: {
                OR: [
                    {
                        startTime: { gt: dayjs().toISOString() },
                    },
                    {
                        startTime: { lte: dayjs().toISOString() },
                        endTime: { gte: dayjs().toISOString() },
                    },
                ],
                isActived: true,
            },
            orderBy: {
                startTime: 'asc',
            },
            take: limit,
            skip: 0,
            select: {
                id: true,
                name: true,
                startTime: true,
                endTime: true,
            },
        });

        if (!flashSales) {
            throw new BadRequestException('No flash sales found');
        }

        return flashSales;
    }

    // Lấy ra danh sách các items thuộc flash sale có id là flashSaleId
    async getItemsByFlashSaleId(filters: Filters) {
        const { flashSaleId, limit = 16, sortBy = 'slot', order = 'asc' } = filters;
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

        return this.prisma.flashSale.findUnique({
            where: {
                id: flashSaleId,
            },
            omit: {
                status: true,
                createdAt: true,
                updatedAt: true,
            },
            include: {
                items: {
                    orderBy: {
                        [sortBy || 'slot']: order || 'asc',
                    },
                    omit: {
                        createdAt: true,
                        updatedAt: true,
                        flashSaleId: true,
                        itemId: true,
                    },
                    take: limit,
                    include: {
                        item: {
                            select: {
                                id: true,
                                barcode: true,
                                name: true,
                                slug: true,
                                thumbnail: true,
                                oldPrice: true,
                            },
                        },
                    },
                },
            },
        });
    }

    async createFlashSale(body: CreateFlashSaleDTO) {
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

    async updateFlashSale(body: UpdateFlashSaleDTO) {
        const { items, startTime, endTime, ...flashSaleData } = body;

        const { status } = await this.prisma.flashSale.findUnique({
            where: {
                id: body.id,
            },
        });

        if (status === FLASHSALE_STATUS.ENDED) {
            throw new BadRequestException('Cannot update an ended flash sale');
        }

        if (status === FLASHSALE_STATUS.ONGOING) {
            throw new BadRequestException('Cannot update an ongoing flash sale');
        }

        await this.prisma.flashSale.update({
            where: {
                id: body.id,
            },
            data: {
                ...flashSaleData,
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

    async deleteFlashSale(flashSaleId: number) {
        const { status } = await this.prisma.flashSale.findUnique({
            where: {
                id: flashSaleId,
            },
        });

        if (status === FLASHSALE_STATUS.ONGOING || status === FLASHSALE_STATUS.ENDED) {
            throw new BadRequestException('Cannot delete an ongoing or ended flash sale');
        }

        await this.prisma.flashSale.delete({
            where: {
                id: flashSaleId,
            },
        });
    }
}
