import { IsArray, IsBoolean, IsNotEmpty, IsNumber } from 'class-validator';
import { CreateItemDTO } from './item.dto';
import { Type } from 'class-transformer';
import { UpdateGalleryDTO } from './update-gallery.dto';
import { OmitType } from '@nestjs/swagger';

export class UpdateItemDTO extends OmitType(CreateItemDTO, ['galleries' as const]) {
    @IsNotEmpty()
    @IsNumber()
    id: number;

    @IsBoolean()
    isActived: boolean = true;

    @IsArray()
    @Type(() => UpdateGalleryDTO)
    galleries: UpdateGalleryDTO[];
}
