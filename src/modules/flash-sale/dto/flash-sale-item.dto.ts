import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime/library';
import { IsNotEmpty, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { PagerDTO } from '~/interfaces/pager.dto';

export class CreateFlashSaleItemDTO {
    @IsNotEmpty()
    @IsNumber()
    itemId: number;

    @IsNotEmpty()
    @IsNumber()
    discountedPrice: number;

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    @Max(100)
    discountPercentage: number;

    @IsOptional()
    @IsNumber()
    quantity?: number;

    @IsOptional()
    @IsNumber()
    orderLimit?: number;

    @IsOptional()
    @IsNumber()
    slot?: number;
}

export class ItemFlashSaleQueryDTO extends OmitType(PagerDTO, ['order', 'sortBy'] as const) {
    @ApiPropertyOptional({ description: 'Id của danh mục' })
    @IsOptional()
    @IsNumber()
    categoryId?: number;
}

export class GetFlashSaleItemDTO {
    flashSaleId: number;
    sold: number;
    slot: number;
    @ApiProperty({ type: 'number' })
    discountedPrice: Decimal;
    discountPercentage: number;
    quantity: number;
}

export class GetFlashSaleDetailItemDTO extends OmitType(GetFlashSaleItemDTO, ['flashSaleId', 'sold'] as const) {
    itemId: number;
    orderLimit: number;
    isActived: boolean;
    item: {
        name: string;
        thumbnail: string;
    };
}

export class GetItemFlashSaleDTO {
    id: number;
    name: string;
    barcode: string;
    slug: string;
    thumbnail: string;
    stock: number;
    weight: string;

    @ApiProperty({ type: 'number' })
    importPrice: Decimal;

    @ApiProperty({ type: 'number' })
    price: Decimal;

    @ApiProperty({ type: 'number' })
    oldPrice: Decimal;
    isActived: boolean;
    isBestseller: boolean;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    flashSales: GetFlashSaleItemDTO[];
}
