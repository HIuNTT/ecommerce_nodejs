import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { PagerDTO } from '~/interfaces/pager.dto';

export class CreateCategoryDTO {
    @ApiProperty({ description: 'Tên danh mục' })
    @IsNotEmpty()
    name: string;

    @ApiProperty({ description: 'Đường dẫn Slug của danh mục, tự động sinh nếu không chỉ định' })
    @IsOptional()
    slug?: string;

    @ApiProperty({ description: 'Id của danh mục cha' })
    @IsOptional()
    @IsNumber()
    parentCatId?: number;

    @ApiProperty({ description: 'Đường dẫn ảnh của danh mục' })
    @IsOptional()
    imageUrl?: string;

    @ApiProperty({ description: 'Vị trí, thứ tự của danh mục' })
    @IsOptional()
    @IsNumber()
    slot?: number;

    @ApiProperty({ description: 'Cấp của danh mục trong cây danh mục, root là cấp 1', example: 1 })
    @IsOptional()
    @IsNumber()
    level?: number;
}

export class GetCategoryDTO {
    // @ApiProperty({ description: 'Id của danh mục' })
    id: number;

    name: string;

    slug: string;

    parentCatId: number;

    imageUrl: string;

    slot: number;

    level: number;

    // @ApiProperty({ description: 'Ẩn/hiện danh mục' })
    isActived: boolean;

    createdAt: Date;
    updatedAt: Date;
}

export class CategoryQueryDTO extends PagerDTO {
    @ApiProperty({ description: 'Từ khóa tìm kiếm' })
    @IsOptional()
    @IsString()
    search?: string;
}

export class TreeCategory {
    id: number;

    @ApiProperty({ description: 'Tên danh mục' })
    name: string;
    slug: string;
    parentCatId: number;
    imageUrl: string;

    @ApiProperty({ description: 'Vị trí, thứ tự của danh mục' })
    slot: number;

    @ApiProperty({ description: 'Cấp của danh mục trong cây danh mục, root là cấp 1' })
    level: number;
    isActived: boolean;
    createdAt: Date;
    updatedAt: Date;
    children?: TreeCategory[];
}
