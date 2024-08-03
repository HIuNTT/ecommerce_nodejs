import { ApiProperty } from '@nestjs/swagger';

export class UploadRes {
    @ApiProperty({ description: 'Đường dẫn ảnh' })
    imageUrl: string;
}
