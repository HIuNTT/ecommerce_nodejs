import { IsNotEmpty, IsNumber, IsOptional, Max, Min } from 'class-validator';

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
