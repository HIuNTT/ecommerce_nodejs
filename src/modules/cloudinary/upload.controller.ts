import {
    BadRequestException,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    UploadedFile,
    UploadedFiles,
    UseInterceptors,
} from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { CloudinaryResponse } from './interfaces/cloudinary-response';

@Controller('upload')
export class UploadController {
    constructor(private readonly cloudinaryService: CloudinaryService) {}

    // Tải lên nhiều ảnh cho banner của từng category
    @Post('banner')
    @UseInterceptors(FilesInterceptor('files'))
    @HttpCode(HttpStatus.OK)
    async uploadBanners(@UploadedFiles() files: Array<Express.Multer.File>): Promise<CloudinaryResponse[]> {
        if (files.length === 0) {
            throw new BadRequestException('No files uploaded');
        }
        return await this.cloudinaryService.uploadImages(files).catch((error) => {
            console.log(error);
            throw new BadRequestException(error);
        });
    }

    // Tải lên 1 ảnh cho category
    @Post('category')
    @UseInterceptors(FileInterceptor('file'))
    @HttpCode(HttpStatus.OK)
    async uploadCategoryImage(@UploadedFile() file: Express.Multer.File): Promise<CloudinaryResponse> {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }
        return await this.cloudinaryService.uploadImage(file).catch((error) => {
            console.log(error);
            throw new BadRequestException(error);
        });
    }

    // Tải lên 1 ảnh cho item
    @Post('item-thumbnail')
    @UseInterceptors(FileInterceptor('file'))
    @HttpCode(HttpStatus.OK)
    async uploadProductImage(@UploadedFile() file: Express.Multer.File): Promise<CloudinaryResponse> {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }
        return await this.cloudinaryService.uploadImage(file).catch((error) => {
            console.log(error);
            throw new BadRequestException(error);
        });
    }

    // Tải lên nhiều ảnh cho item
    @Post('item-detail-image')
    @UseInterceptors(FilesInterceptor('files'))
    @HttpCode(HttpStatus.OK)
    async uploadProductImages(@UploadedFiles() files: Array<Express.Multer.File>): Promise<CloudinaryResponse[]> {
        if (files.length === 0) {
            throw new BadRequestException('No files uploaded');
        }
        return await this.cloudinaryService.uploadImages(files).catch((error) => {
            console.log(error);
            throw new BadRequestException(error);
        });
    }
}
