import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateCategoryDTO {
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    slug: string;

    @IsOptional()
    @IsNumber()
    parentCatId?: number;

    @IsOptional()
    imageUrl?: string;

    @IsOptional()
    @IsNumber()
    slot?: number;

    @IsOptional()
    @IsNumber()
    level?: number;
}
