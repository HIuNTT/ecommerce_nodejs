import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateGalleryDTO {
    @IsNotEmpty()
    imageUrl: string;

    @IsOptional()
    @IsNumber()
    slot?: number;
}
