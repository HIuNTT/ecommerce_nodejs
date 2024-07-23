import { IsArray, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { CreateGalleryDTO } from './gallery.dto';
import { Type } from 'class-transformer';
import { BasePagination } from '~/interfaces';
import { Decimal } from '@prisma/client/runtime/library';

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

export interface ItemPagination<T, K extends keyof T> extends BasePagination {
    items: Omit<T, K>;
}

export class GetItemOfOrder {
    id: number;
    name: string;
    thumbnail: string;
    oldPrice: number | Decimal;
}
