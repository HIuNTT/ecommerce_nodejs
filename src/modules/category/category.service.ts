import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { Category } from '@prisma/client';
import { Filters, PaginationResult } from 'src/interfaces/find-all.interface';
import { CategoryDTO } from './dto';
import { successResponse } from 'src/helpers/response.helper';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class CategoryService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly cloudinaryService: CloudinaryService,
    ) {}

    async findAll(filters: Filters): Promise<PaginationResult<Category>> {
        const itemsPerPage = Number(filters.itemsPerPage) || 10;
        const page = Number(filters.page) || 1;
        const search = filters.search || '';

        const skip = page > 1 ? (page - 1) * itemsPerPage : 0;
        const [categories, total] = await Promise.all([
            this.prisma.category.findMany({
                take: itemsPerPage,
                skip,
                where: {
                    OR: [
                        {
                            name: { contains: search },
                        },
                        {
                            slug: { contains: search },
                        },
                        {
                            description: { contains: search },
                        },
                    ],
                    AND: [
                        {
                            isActived: true,
                        },
                    ],
                },
                include: {
                    banners: {
                        where: {
                            isActived: true,
                        },
                        orderBy: {
                            createdAt: 'desc',
                        },
                        select: {
                            imageUrl: true,
                            slug: true,
                            slot: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            this.prisma.category.count({
                where: {
                    OR: [
                        {
                            name: { contains: search },
                        },
                        {
                            slug: { contains: search },
                        },
                        {
                            description: { contains: search },
                        },
                    ],
                    AND: [
                        {
                            isActived: true,
                        },
                    ],
                },
            }),
        ]);

        return {
            count: total,
            total_pages: Math.ceil(total / itemsPerPage),
            current_page: page,
            data: categories,
        };
    }

    async create(data: CategoryDTO, file: Express.Multer.File): Promise<successResponse<CategoryDTO>> {
        const imgUrl = await this.cloudinaryService.uploadImage(file).catch(() => {
            throw new BadRequestException('Invalid file type');
        });

        data.imageUrl = String(imgUrl.secure_url);

        const category = await this.prisma.category.create({
            data,
            select: {
                name: true,
                slug: true,
                description: true,
                imageUrl: true,
            },
        });
        return new successResponse<CategoryDTO>(category, HttpStatus.OK, 'Category created successfully');
    }

    async update(data: CategoryDTO, id: number): Promise<successResponse<CategoryDTO>> {
        const category = await this.prisma.category.update({
            where: {
                id,
            },
            data,
            select: {
                name: true,
                slug: true,
                description: true,
                imageUrl: true,
                isActived: true,
            },
        });
        return new successResponse<CategoryDTO>(category, HttpStatus.OK, 'Category created successfully');
    }

    async detele(id: number): Promise<successResponse<null>> {
        try {
            await this.prisma.category.delete({
                where: {
                    id,
                },
            });
            return new successResponse(null, HttpStatus.OK, 'Category deleted successfully');
        } catch (error) {
            throw new BadRequestException(error);
        }
    }
}
