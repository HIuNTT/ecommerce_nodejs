import {
    BadRequestException,
    Controller,
    HttpCode,
    HttpStatus,
    ParseFilePipe,
    Post,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { CloudinaryService } from '../../shared/cloudinary/cloudinary.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { fileValidators } from '../../validators/file.validator';
import { isEmpty } from 'lodash';
import { UploadRes } from '~/interfaces';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResult } from '~/decorators';
import { FilesUploadDTO } from './dto/upload.dto';
import { AccessTokenGuard } from '../auth/guards';

@ApiTags('Upload - Tải ảnh lên cloud')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller('upload')
export class UploadController {
    constructor(private readonly cloudinaryService: CloudinaryService) {}

    @Post('images')
    @UseInterceptors(FilesInterceptor('files'))
    @ApiOperation({ summary: 'Tải ảnh lên cloud' })
    @ApiResult({ type: [UploadRes] })
    @ApiConsumes('multipart/form-data')
    @ApiBody({ type: FilesUploadDTO })
    @HttpCode(HttpStatus.OK)
    async uploadProductImages(
        @UploadedFiles(
            new ParseFilePipe({
                validators: fileValidators,
            }),
        )
        files: Express.Multer.File[],
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
