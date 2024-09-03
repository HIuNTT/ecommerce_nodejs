import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '~/shared/prisma/prisma.service';
import { CreateItemDTO, GetItemDetailDTO, GetItemDTO, ItemQueryDTO } from './dto/item.dto';
import slugify from 'slugify';
import { UpdateItemDTO } from './dto/update-item.dto';
import { isArray, isNumber } from 'lodash';
import { OrderService } from '../order/order.service';
import dayjs from 'dayjs';
import { createPagination } from '~/helpers/paginate/create-pagination';
import { Pagination } from '~/helpers/paginate/pagination';

@Injectable()
export class ItemService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly orderService: OrderService,
    ) {}

    async getListItem(filters: ItemQueryDTO): Promise<Pagination<GetItemDTO>> {
        console.log(filters);

        const { limit, page, order, sortBy, search, categoryId, min, max, actived, user } = filters;

        console.log(categoryId);
        const searchKey = search ? search.trim().split(/\s+/).join(' & ') : '';

        const [items, totalCount] = await Promise.all([
            this.prisma.item.findMany({
                take: limit,
                skip: filters.skip,
                where: {
                    ...(searchKey && {
                        OR: [
                            { name: { search: searchKey, mode: 'insensitive' } },
                            { description: { search: searchKey, mode: 'insensitive' } },
                            { slug: { search: searchKey, mode: 'insensitive' } },
                        ],
                    }),
                    ...(isArray(categoryId) && { categories: { some: { categoryId: { in: categoryId } } } }),
                    ...(isNumber(categoryId) && { categories: { some: { categoryId } } }),
                    price: { gte: min, lte: max },
                    isActived: actived,
                },
                orderBy: sortBy && sortBy in GetItemDTO ? { [sortBy]: order || 'desc' } : { updatedAt: 'desc' },
                omit: {
                    isBestseller: true,
                    importPrice: true,
                },
                include: {
                    categories: {
                        select: {
                            category: true,
                        },
                    },
                    ...(user && {
                        flashSales: {
                            where: {
                                flashSale: {
                                    endTime: {
                                        gte: dayjs().toISOString(),
                                    },
                                },
                            },
                            omit: {
                                itemId: true,
                                createdAt: true,
                                updatedAt: true,
                            },
                        },
                    }),
                },
            }),
            this.prisma.item.count({
                where: {
                    ...(searchKey && {
                        OR: [
                            { name: { search: searchKey, mode: 'insensitive' } },
                            { description: { search: searchKey, mode: 'insensitive' } },
                            { slug: { search: searchKey, mode: 'insensitive' } },
                        ],
                    }),
                    ...(isArray(categoryId) && { categories: { some: { categoryId: { in: categoryId } } } }),
                    ...(isNumber(categoryId) && { categories: { some: { categoryId } } }),
                    price: { gte: min, lte: max },
                    isActived: actived,
                },
            }),
        ]);

        return createPagination<GetItemDTO>({
            items,
            totalCount,
            currentPage: page,
            limit,
        });
    }

    async getItemById(itemId: number, user: boolean): Promise<GetItemDetailDTO> {
        const item = await this.prisma.item.findUnique({
            where: {
                id: itemId,
            },
            include: {
                ...(user && {
                    flashSales: {
                        where: {
                            flashSale: {
                                endTime: {
                                    gte: dayjs().toISOString(),
                                },
                            },
                        },
                        omit: {
                            itemId: true,
                            createdAt: true,
                            updatedAt: true,
                        },
                    },
                }),
                categories: {
                    select: {
                        category: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                            },
                        },
                    },
                },
                galleries: {
                    select: {
                        imageUrl: true,
                        slot: true,
                    },
                },
            },
        });

        if (!item) {
            throw new BadRequestException('Item not found');
        }

        return item;
    }

    async createItem(body: CreateItemDTO) {
        const { galleries, categories, ...itemData } = body;

        await this.prisma.item.create({
            data: {
                ...itemData,
                slug: slugify(itemData.name, { lower: true, strict: true, locale: 'vi' }),
                galleries: {
                    createMany: {
                        data: galleries.map((gallery, index) => ({
                            imageUrl: gallery.imageUrl,
                            slot: gallery.slot || index + 1,
                        })),
                    },
                },
                categories: {
                    create: categories.map((category) => ({
                        category: {
                            connect: {
                                id: category.id,
                            },
                        },
                    })),
                },
            },
        });
    }

    async updateItem(body: UpdateItemDTO) {
        const { galleries, categories, ...itemData } = body;
        await this.prisma.item.update({
            where: {
                id: itemData.id,
            },
            data: {
                ...itemData,
                slug: slugify(itemData.name, { lower: true, strict: true, locale: 'vi' }),
                galleries: {
                    // Xóa tất cả các ảnh và tạo mới hoàn toàn
                    deleteMany: {},
                    create: galleries.map((gallery, index) => ({
                        imageUrl: gallery.imageUrl,
                        slot: gallery.slot || index + 1,
                    })),
                },
                categories: {
                    // Xóa tất cả bản ghi có itemId trong bảng trung gian giữa category và item
                    deleteMany: {},
                    create: categories.map((category) => ({
                        category: {
                            connect: {
                                id: category.id,
                            },
                        },
                    })),
                },
            },
        });
    }

    async deleteItem(itemId: number): Promise<void> {
        const itemInOrder = await this.orderService.findOrderByItemId(itemId);
        if (itemInOrder) {
            throw new BadRequestException('Item is in order, cannot delete');
        }

        await this.prisma.item.delete({
            where: {
                id: itemId,
            },
        });
    }
}
