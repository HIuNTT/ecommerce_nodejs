import { Expose, Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional } from 'class-validator';

export class Filters {
    @IsOptional()
    @IsNumber()
    @Expose()
    limit?: number;

    @IsOptional()
    @IsNumber()
    offset?: number;

    @IsOptional()
    @IsNumber()
    page?: number;

    @IsOptional()
    order?: 'desc' | 'asc'; //desc or asc

    @IsOptional()
    sortBy?: string; // price, createdAt, updatedAt

    @IsOptional()
    search?: string;

    @IsOptional()
    @Type(() => Number)
    categoryId?: Array<number> | number; // lọc theo danh mục con

    @IsOptional()
    @IsNumber()
    flashSaleId?: number;

    @IsOptional()
    @IsNumber()
    minPrice?: number;

    @IsOptional()
    @IsNumber()
    maxPrice?: number; // lọc theo giá cả

    @IsOptional()
    @IsNumber()
    type?: number; // Mã status của đơn hàng
}

export class BaseInfiniteScroll {
    nextOffset: number;
}
