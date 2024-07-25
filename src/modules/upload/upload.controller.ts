import {
    BadRequestException,
    Controller,
    HttpCode,
    HttpStatus,
    ParseFilePipe,
    Post,
    UploadedFiles,
    UseInterceptors,
} from '@nestjs/common';
import { CloudinaryService } from '../../shared/cloudinary/cloudinary.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { fileValidators } from '../../validators/file.validator';
import { isEmpty } from 'lodash';
import { UploadRes } from '~/interfaces';

@Controller('upload')
export class UploadController {
    constructor(private readonly cloudinaryService: CloudinaryService) {}

    @Post('images')
    @UseInterceptors(FilesInterceptor('files'))
    @HttpCode(HttpStatus.OK)
    async uploadProductImages(
        @UploadedFiles(
            new ParseFilePipe({
                validators: fileValidators,
            }),
        )
        files: Array<Express.Multer.File>,
    ): Promise<UploadRes[]> {
        if (isEmpty(files)) {
            throw new BadRequestException('No files uploaded');
        }

        return await Promise.all(
            files.map(async (file) => {
                return await this.cloudinaryService.upload(file);
            }),
        );
    }
}
