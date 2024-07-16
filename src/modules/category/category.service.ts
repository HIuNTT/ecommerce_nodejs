import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '~/shared/prisma/prisma.service';
import { Category } from '@prisma/client';
import { CreateCategoryDTO, UpdateCategoryDTO } from './dto';

@Injectable()
export class CategoryService {
    constructor(private readonly prisma: PrismaService) {}

    // Create category
    async createCategory(body: CreateCategoryDTO): Promise<Omit<Category, 'updatedAt' | 'isActived'>> {
        const category = await this.prisma.category.create({
            data: {
                ...body,
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

        return category;
    }

    // Update category
    async updateCategory(body: UpdateCategoryDTO): Promise<Omit<Category, 'isActived'>> {
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

        return category;
    }

    async deleteCategory(catId: number) {
        await this.prisma.category.delete({
            where: {
                id: catId,
            },
        });
    }

    async hideCategory(catId: number) {
        await this.prisma.category.update({
            where: {
                id: catId,
            },
            data: {
                isActived: false,
            },
        });
    }

    async showCategory(catId: number) {
        await this.prisma.category.update({
            where: {
                id: catId,
            },
            data: {
                isActived: true,
            },
        });
    }

    async getHomepageCategoryList(): Promise<Omit<Category, 'isActived' | 'createdAt' | 'updatedAt'>[]> {
        const categories = await this.prisma.category.findMany({
            where: {
                isActived: true,
                parentCatId: null,
            },
            omit: {
                createdAt: true,
                updatedAt: true,
                isActived: true,
            },
            include: {
                children: false,
            },
            orderBy: {
                slot: 'asc',
            },
        });
        return categories.map((category) => ({
            ...category,
            children: null,
        }));
    }

    // chỉ lấy các category con thôi, không lấy các category cháu
    async getChildrenCategory(parentCatId: number) {
        const categories = await this.prisma.category.findMany({
            where: {
                isActived: true,
                parentCatId,
            },
            omit: {
                createdAt: true,
                updatedAt: true,
                isActived: true,
            },
            include: {
                children: true,
            },
            orderBy: {
                slot: 'asc',
            },
        });

        return categories;
    }
}
