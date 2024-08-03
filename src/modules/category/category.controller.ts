import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Put, Query, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryQueryDTO, CreateCategoryDTO, GetCategoryDTO, TreeCategory, UpdateCategoryDTO } from './dto';
import { ApiResult, IdParam, Roles } from '~/decorators';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ROLE } from '~/enums/role.enum';
import { AccessTokenGuard } from '../auth/guards';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Pagination } from '~/helpers/paginate/pagination';

@ApiTags('Category - Danh mục sản phẩm')
@Controller('category')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) {}

    @Post('create')
    @ApiOperation({ summary: 'Thêm danh mục mới', description: '* Chỉ admin hoặc quản lý mới có quyền thêm' })
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @Roles(ROLE.ADMIN, ROLE.MANAGER)
    @UseGuards(AccessTokenGuard, RolesGuard)
    async create(@Body() body: CreateCategoryDTO): Promise<void> {
        await this.categoryService.createCategory(body);
    }

    @Put('update')
    @ApiOperation({ summary: 'Chỉnh sửa danh mục', description: '* Chỉ admin hoặc quản lý mới có quyền chỉnh sửa' })
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @Roles(ROLE.ADMIN, ROLE.MANAGER)
    @UseGuards(AccessTokenGuard, RolesGuard)
    async update(@Body() body: UpdateCategoryDTO): Promise<void> {
        await this.categoryService.updateCategory(body);
    }

    @Delete('delete/:id')
    @ApiOperation({ summary: 'Xóa danh mục', description: '* Chỉ admin hoặc quản lý mới có quyền xóa' })
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @Roles(ROLE.ADMIN, ROLE.MANAGER)
    @UseGuards(AccessTokenGuard, RolesGuard)
    async delete(@IdParam() catId: number): Promise<void> {
        await this.categoryService.deleteCategory(catId);
    }

    @Get()
    @ApiOperation({ summary: 'Lấy ra tất cả danh mục (Trang Admin)' })
    @ApiResult({ type: [GetCategoryDTO], isPage: true })
    async list(@Query() filters: CategoryQueryDTO): Promise<Pagination<GetCategoryDTO>> {
        return await this.categoryService.getCategoryList(filters);
    }

    @Get('get-homepage-category-list')
    @ApiOperation({ summary: 'Lấy ra danh sách danh mục root', description: 'Dùng để hiện ở homepage' })
    @ApiResult({ type: [GetCategoryDTO] })
    async getHomepageCategoryList(): Promise<GetCategoryDTO[]> {
        return await this.categoryService.getHomepageCategoryList();
    }

    @Get('get-children-category/:id')
    @ApiOperation({
        summary: 'Lấy ra danh sách danh mục con của 1 danh mục cha',
        description: 'Chỉ lấy danh mục con, cấp ngay sau danh mục cha',
    })
    @ApiResult({ type: [GetCategoryDTO] })
    async getChildrenCategory(@IdParam() parentCatId: number): Promise<GetCategoryDTO[]> {
        return await this.categoryService.getChildrenCategory(parentCatId);
    }

    @Get('get-category-tree')
    @ApiOperation({ summary: 'Lấy ra cây danh mục' })
    @ApiResult({ type: [TreeCategory] })
    async getCategoryTree(): Promise<TreeCategory[]> {
        return await this.categoryService.getCategoryTree();
    }
}
