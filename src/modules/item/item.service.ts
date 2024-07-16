import { Injectable } from '@nestjs/common';
import { PrismaService } from '~/shared/prisma/prisma.service';
import { CreateItemDTO } from './dto/item.dto';
import slugify from 'slugify';
import { Item } from '@prisma/client';
import { UpdateItemDTO } from './dto/update-item.dto';
import { Filters } from '~/interfaces';
import { isArray, isNumber } from 'lodash';

@Injectable()
export class ItemService {
    constructor(private readonly prisma: PrismaService) {}

    async getListItem(filters: Filters) {
        const {
            limit = 20,
            page = 1,
            order = '',
            sortBy = '',
            search = '',
            categoryId,
            minPrice = 0,
            maxPrice = 999999999,
        } = filters;
        const skip = page > 1 ? (page - 1) * limit : 0;

        const searchKey = search ? search.trim().split(/\s+/).join(' & ') : '';

        const [items, totalCount] = await this.prisma.$transaction([
            this.prisma.item.findMany({
                take: limit,
                skip,
                where: {
                    AND: [
                        searchKey
                            ? {
                                  OR: [
                                      { name: { search: searchKey, mode: 'insensitive' } },
                                      { description: { search: searchKey, mode: 'insensitive' } },
                                      { slug: { search: searchKey, mode: 'insensitive' } },
                                  ],
                              }
                            : {},
                        categoryId
                            ? isArray(categoryId)
                                ? { categories: { some: { categoryId: { in: categoryId } } } }
                                : isNumber(categoryId)
                                  ? { categories: { some: { categoryId } } }
                                  : {}
                            : {},
                        { price: { gte: minPrice, lte: maxPrice } },
                        { isActived: true },
                    ],
                },
                orderBy: sortBy ? { [sortBy]: order || 'desc' } : { updatedAt: 'desc' },
                omit: {
                    isBestseller: true,
                },
            }),
            this.prisma.item.count({
                where: {
                    AND: [
                        searchKey
                            ? {
                                  OR: [
                                      { name: { search: searchKey, mode: 'insensitive' } },
                                      { description: { search: searchKey, mode: 'insensitive' } },
                                      { slug: { search: searchKey, mode: 'insensitive' } },
                                  ],
                              }
                            : {},
                        categoryId
                            ? isArray(categoryId)
                                ? { categories: { some: { categoryId: { in: categoryId } } } }
                                : isNumber(categoryId)
                                  ? { categories: { some: { categoryId } } }
                                  : {}
                            : {},
                        { price: { gte: minPrice, lte: maxPrice } },
                        { isActived: true },
                    ],
                },
            }),
        ]);

        return {
            totalCount,
            totalPage: Math.ceil(totalCount / limit),
            pageIndex: page,
            pageSize: limit,
            items,
        };
    }

    async getItemById(itemId: number): Promise<Omit<Item, 'isActived' | 'isBestseller' | 'createdAt'>> {
        return await this.prisma.item
            .findUnique({
                where: {
                    id: itemId,
                },
                omit: {
                    isBestseller: true,
                    createdAt: true,
                    isActived: true,
                },
                include: {
                    categories: {
                        select: {
                            category: {
                                select: {
                                    id: true,
                                    name: true,
                                    level: true,
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
            })
            .then((resultItems) => {
                const newCat = resultItems.categories.map((category) => category.category);
                return {
                    ...resultItems,
                    categories: newCat,
                };
            });
    }

    async getItemBySlug(slug: string): Promise<Omit<Item, 'isActived' | 'isBestseller' | 'createdAt'>> {
        return await this.prisma.item
            .findUnique({
                where: {
                    slug,
                },
                omit: {
                    isBestseller: true,
                    createdAt: true,
                    isActived: true,
                },
                include: {
                    categories: {
                        select: {
                            category: {
                                select: {
                                    id: true,
                                    name: true,
                                    level: true,
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
            })
            .then((resultItems) => {
                const newCat = resultItems.categories.map((category) => category.category);
                return {
                    ...resultItems,
                    categories: newCat,
                };
            });
    }

    async createItem(body: CreateItemDTO): Promise<Omit<Item, 'updatedAt' | 'isBestseller'>> {
        const { galleries, categories, ...itemData } = body;

        return await this.prisma.item.create({
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
            omit: {
                updatedAt: true,
                isBestseller: true,
            },
            include: {
                galleries: {
                    select: {
                        imageUrl: true,
                        slot: true,
                        createdAt: true,
                    },
                },
                categories: {
                    select: {
                        category: {
                            select: {
                                id: true,
                                name: true,
                                level: true,
                                slug: true,
                            },
                        },
                    },
                },
            },
        });
    }

    async updateItem(body: UpdateItemDTO): Promise<Omit<Item, 'createdAt' | 'isBestseller'>> {
        const { galleries, categories, ...itemData } = body;
        return await this.prisma.item
            .update({
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
                omit: {
                    createdAt: true,
                    isBestseller: true,
                },
                include: {
                    galleries: {
                        select: {
                            id: true,
                            imageUrl: true,
                            slot: true,
                            updatedAt: true,
                        },
                    },
                    categories: {
                        select: {
                            category: {
                                select: {
                                    id: true,
                                    name: true,
                                    level: true,
                                },
                            },
                        },
                    },
                },
            })
            .then((resultItems) => {
                const newCat = resultItems.categories.map((category) => category.category);
                return {
                    ...resultItems,
                    categories: newCat,
                };
            });
    }

    async deleteItem(itemId: number) {
        return await this.prisma.item.delete({
            where: {
                id: itemId,
            },
        });
    }
}
