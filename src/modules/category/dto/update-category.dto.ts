import { ApiProperty } from '@nestjs/swagger';
import { CreateCategoryDTO } from './category.dto';
import { IsBoolean, IsNumber } from 'class-validator';

export class UpdateCategoryDTO extends CreateCategoryDTO {
    @ApiProperty({ description: 'Mã của danh mục cần chỉnh sửa' })
    @IsNumber()
    id: number;

    @ApiProperty({ description: 'Ẩn/hiện danh mục', example: true })
    @IsBoolean()
    isActived: boolean = true;
}
