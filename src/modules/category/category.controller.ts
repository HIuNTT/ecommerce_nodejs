import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDTO, UpdateCategoryDTO } from './dto';
import { Category } from '@prisma/client';
import { IdParam, Public, Roles } from '~/decorators';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ROLE } from '~/enums/role.enum';
import { AccessTokenGuard } from '../auth/guards';

@Controller('category')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) {}

    @Post('create')
    @HttpCode(HttpStatus.OK)
    @Roles(ROLE.ADMIN, ROLE.MANAGER)
    @UseGuards(AccessTokenGuard, RolesGuard)
    async createCategory(@Body() body: CreateCategoryDTO): Promise<Omit<Category, 'updatedAt' | 'isActived'>> {
        return await this.categoryService.createCategory(body);
    }

    @Put('update')
    @HttpCode(HttpStatus.OK)
    @Roles(ROLE.ADMIN, ROLE.MANAGER)
    @UseGuards(AccessTokenGuard, RolesGuard)
    async updateCategory(@Body() body: UpdateCategoryDTO): Promise<Omit<Category, 'isActived'>> {
        return await this.categoryService.updateCategory(body);
    }

    @Delete('delete/:id')
    @HttpCode(HttpStatus.OK)
    @Roles(ROLE.ADMIN, ROLE.MANAGER)
    @UseGuards(AccessTokenGuard, RolesGuard)
    async deleteCategory(@IdParam() catId: number): Promise<void> {
        await this.categoryService.deleteCategory(catId);
    }

    @Patch('hidden/:id')
    @HttpCode(HttpStatus.OK)
    @Roles(ROLE.ADMIN, ROLE.MANAGER)
    @UseGuards(AccessTokenGuard, RolesGuard)
    async hideCategory(@IdParam() catId: number): Promise<void> {
        await this.categoryService.hideCategory(catId);
    }

    @Patch('show/:id')
    @HttpCode(HttpStatus.OK)
    @Roles(ROLE.ADMIN, ROLE.MANAGER)
    @UseGuards(AccessTokenGuard, RolesGuard)
    async showCategory(@IdParam() catId: number): Promise<void> {
        await this.categoryService.showCategory(catId);
    }

    @Get('get-homepage-category-list')
    @Public()
    async getHomepageCategoryList() {
        const data = await this.categoryService.getHomepageCategoryList();
        return { category_list: data };
    }

    @Get('get-children-category/:id')
    @Public()
    async getChildrenCategory(@IdParam() parentCatId: number) {
        return await this.categoryService.getChildrenCategory(parentCatId);
    }
}
