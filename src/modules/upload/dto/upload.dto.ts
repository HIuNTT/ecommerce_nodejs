import { ApiProperty } from '@nestjs/swagger';

export class FilesUploadDTO {
    @ApiProperty({
        type: 'array',
        items: { type: 'string', format: 'binary' },
        description: 'file',
    })
    files: Express.Multer.File[];
}
