import { IsArray, IsISO8601, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { CreateFlashSaleItemDTO } from './flash-sale-item.dto';
import { Type } from 'class-transformer';
import { EFlashSaleStatus } from '@prisma/client';

export class CreateFlashSaleDTO {
    @IsOptional()
    @IsString()
    name?: string;

    @IsNotEmpty()
    @IsISO8601()
    startTime: string;

    @IsNotEmpty()
    @IsISO8601()
    endTime: string;

    @IsNotEmpty()
    @IsArray()
    @Type(() => CreateFlashSaleItemDTO)
    items: CreateFlashSaleItemDTO[];
}

export class UpdateFlashSaleDTO extends CreateFlashSaleDTO {
    @IsNotEmpty()
    @IsNumber()
    id: number;
}
