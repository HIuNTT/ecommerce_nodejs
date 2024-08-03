import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsNumberString, IsOptional, IsString } from 'class-validator';
import { CreateGalleryDTO } from './gallery.dto';
import { Transform, Type } from 'class-transformer';
import { Decimal } from '@prisma/client/runtime/library';
import { PagerDTO } from '~/interfaces/pager.dto';
import { ApiProperty, ApiPropertyOptional, OmitType, PickType } from '@nestjs/swagger';
import { GetCategoryDTO } from '~/modules/category/dto';
import { GetFlashSaleItemDTO } from '~/modules/flash-sale/dto/flash-sale-item.dto';
import { isNumber, isString } from 'lodash';

export class CatConnectedDTO {
    @IsNotEmpty()
    @IsNumber()
    id: number;

    @IsOptional()
    name?: string;
}

export class CreateItemDTO {
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    barcode: string;

    @IsOptional()
    slug: string;

    @IsNotEmpty()
    thumbnail: string;

    @IsNotEmpty()
    @IsNumber()
    stock: number;

    @IsNotEmpty()
    weight: string;

    @IsNotEmpty()
    @IsNumber()
    importPrice: number;

    @IsNotEmpty()
    @IsNumber()
    price: number;

    @IsOptional()
    @IsNumber()
    oldPrice?: number;

    @IsNotEmpty()
    description: string;

    @IsArray()
    @Type(() => CreateGalleryDTO)
    galleries: CreateGalleryDTO[];

    @IsOptional()
    @IsArray()
    @Type(() => CatConnectedDTO)
    categories?: CatConnectedDTO[];
}

export class GetCategoryItemDTO {
    @ApiProperty({ type: GetCategoryDTO })
    category: GetCategoryDTO;
}

export class GetItemDTO extends OmitType(CreateItemDTO, [
    'galleries',
    'price',
    'oldPrice',
    'importPrice',
    'categories',
    'importPrice',
] as const) {
    id: number;
    price: Decimal;
    oldPrice: Decimal;
    categories: GetCategoryItemDTO[];

    @ApiPropertyOptional({ type: [GetFlashSaleItemDTO] })
    flashSales?: GetFlashSaleItemDTO[];
}

export class GetCategoryItemDetailDTO {
    @ApiProperty({ type: PickType(GetCategoryDTO, ['id', 'name', 'slug'] as const) })
    category: Pick<GetCategoryDTO, 'id' | 'name' | 'slug'>;
}

export class GetItemDetailDTO extends OmitType(CreateItemDTO, [
    'categories',
    'price',
    'oldPrice',
    'importPrice',
] as const) {
    id: number;
    price: Decimal;
    oldPrice: Decimal;
    importPrice: Decimal;
    categories: GetCategoryItemDetailDTO[];

    @ApiPropertyOptional({ type: [GetFlashSaleItemDTO] })
    flashSales?: GetFlashSaleItemDTO[];
}

export class GetItemOfOrder {
    id: number;
    name: string;
    thumbnail: string;
    oldPrice: number | Decimal;
}

export class ItemQueryDTO extends PagerDTO {
    @ApiProperty({ description: 'Từ khóa tìm kiếm' })
    @IsString()
    @IsOptional()
    search?: string;

    @ApiPropertyOptional({ description: 'Mã danh mục. VD: 23,34 nếu lọc theo nhiều danh mục', type: 'array' })
    @IsOptional()
    // @Transform(({ value }) => {
    //     isNumber(value) ? value : Number(value);
    // })
    categoryId?: number;

    @ApiProperty({ description: 'Giá từ' })
    @IsNumber()
    @IsOptional()
    min?: number;

    @ApiProperty({ description: 'Giá đến' })
    @IsNumber()
    @IsOptional()
    max?: number;

    @ApiPropertyOptional({ description: 'Trạng thái bật/tắt của sản phẩm' })
    @IsBoolean()
    @IsOptional()
    actived?: boolean;

    @ApiPropertyOptional({ description: 'Dành cho trang user hay không' })
    @IsBoolean()
    @IsOptional()
    user?: boolean;
}
