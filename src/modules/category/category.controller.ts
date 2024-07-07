import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Post,
    Put,
    Query,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Filters, PaginationResult } from '../../interfaces';
import { Category } from '@prisma/client';
import { CategoryService } from './category.service';
import { CategoryDTO } from './dto';
import { successResponse } from 'src/helpers/response.helper';

@Controller('category')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) {}

    @Get()
    async getAll(@Query() filters: Filters): Promise<PaginationResult<Category>> {
        return this.categoryService.findAll(filters);
    }

    @Post('create')
    @UseInterceptors(FileInterceptor('image'))
    @HttpCode(HttpStatus.OK)
    async createCategory(
        @UploadedFile() file: Express.Multer.File,
        @Body() body: CategoryDTO,
    ): Promise<successResponse<CategoryDTO>> {
        return await this.categoryService.create(body, file);
    }

    @Put('update/:id')
    @HttpCode(HttpStatus.OK)
    async updateCategory(
        @Body() body: CategoryDTO,
        @Param('id', ParseIntPipe) id: number,
    ): Promise<successResponse<CategoryDTO>> {
        return await this.categoryService.update(body, id);
    }

    @Delete('delete/:id')
    @HttpCode(HttpStatus.OK)
    async deleteCategory(@Param() id: number): Promise<successResponse<null>> {
        return await this.categoryService.detele(id);
    }
}
