import { IsArray, IsNotEmpty, IsNumber } from 'class-validator';
import { CreateItemDTO } from './item.dto';
import { OmitType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { UpdateGalleryDTO } from './update-gallery.dto';

export class UpdateItemDTO extends OmitType(CreateItemDTO, ['galleries' as const]) {
    @IsNotEmpty()
    @IsNumber()
    id: number;

    @IsArray()
    @Type(() => UpdateGalleryDTO)
    galleries: UpdateGalleryDTO[];
}
