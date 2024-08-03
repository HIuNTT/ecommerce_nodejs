import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '~/shared/prisma/prisma.service';
import { CategoryQueryDTO, CreateCategoryDTO, GetCategoryDTO, TreeCategory, UpdateCategoryDTO } from './dto';
import slugify from 'slugify';
import { createPagination } from '~/helpers/paginate/create-pagination';
import { Pagination } from '~/helpers/paginate/pagination';

@Injectable()
export class CategoryService {
    constructor(private readonly prisma: PrismaService) {}

    // Create category
    async createCategory(body: CreateCategoryDTO): Promise<void> {
        const category = await this.prisma.category.create({
            data: {
                ...body,
                slug: body.slug || slugify(body.name, { lower: true, strict: true, locale: 'vi' }),
                parentCatId: body.parentCatId || null,
            },
            omit: {
                isActived: true,
                updatedAt: true,
            },
        });

        if (!category) {
            throw new BadRequestException('Failed to create category');
        }
    }

    // Update category
    async updateCategory(body: UpdateCategoryDTO): Promise<void> {
        const category = await this.prisma.category.update({
            where: {
                id: body.id,
            },
            data: {
                ...body,
            },
        });

        if (!category) {
            throw new BadRequestException('Failed to update category');
        }
    }

    async deleteCategory(catId: number) {
        await this.prisma.category.delete({
            where: {
                id: catId,
            },
        });
    }

    async getCategoryList(filters: CategoryQueryDTO): Promise<Pagination<GetCategoryDTO>> {
        const { limit, page, order, sortBy, ...query } = filters;

        const searchKey = query.search ? query.search.trim().split(/\s+/).join(' & ') : '';

        const [categories, totalCount] = await this.prisma.$transaction([
            this.prisma.category.findMany({
                take: limit,
                skip: filters.skip,
                where: {
                    ...(searchKey && {
                        OR: [
                            { name: { search: searchKey, mode: 'insensitive' } },
                            { slug: { search: searchKey, mode: 'insensitive' } },
                        ],
                    }),
                },
                orderBy: sortBy && sortBy in GetCategoryDTO ? { [sortBy]: order } : { createdAt: 'asc' },
            }),
            this.prisma.category.count({
                where: {
                    ...(searchKey && {
                        OR: [
                            { name: { search: searchKey, mode: 'insensitive' } },
                            { slug: { search: searchKey, mode: 'insensitive' } },
                        ],
                    }),
                },
            }),
        ]);

        return createPagination<GetCategoryDTO>({
            items: categories,
            totalCount,
            currentPage: page,
            limit,
        });
    }

    async getHomepageCategoryList(): Promise<GetCategoryDTO[]> {
        const categories = await this.prisma.category.findMany({
            where: {
                isActived: true,
                parentCatId: null,
                level: 1,
            },
            orderBy: {
                slot: 'asc',
            },
        });
        return categories;
    }

    // chỉ lấy các category con thôi, không lấy các category cháu
    async getChildrenCategory(parentCatId: number): Promise<GetCategoryDTO[]> {
        const categories = await this.prisma.category.findMany({
            where: {
                isActived: true,
                parentCatId,
            },
            orderBy: {
                slot: 'asc',
            },
        });

        return categories;
    }

    async getCategoryTree(): Promise<TreeCategory[]> {
        const categories = await this.prisma.category.findMany({});

        const tree = categories.reduce((acc, cat) => {
            Object.assign((acc[cat.id] = acc[cat.id] || {}), cat);
            ((acc[cat.parentCatId] ??= {}).children ??= []).push(acc[cat.id]);
            return acc;
        }, {})['null'].children;

        return tree;
    }
}
