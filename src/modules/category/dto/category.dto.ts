import { Exclude } from 'class-transformer';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CategoryDTO {
    @Exclude()
    name: string;

    @IsNotEmpty()
    slug: string;

    @IsOptional()
    description: string;

    imageUrl?: string;
    isActived?: boolean;
}
