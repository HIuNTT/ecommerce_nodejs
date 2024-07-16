import { IsOptional } from 'class-validator';
import { CreateGalleryDTO } from './gallery.dto';

export class UpdateGalleryDTO extends CreateGalleryDTO {
    @IsOptional()
    id?: string;
}
