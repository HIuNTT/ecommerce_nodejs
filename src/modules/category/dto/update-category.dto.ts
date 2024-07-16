import { CreateCategoryDTO } from './category.dto';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateCategoryDTO extends CreateCategoryDTO {
    @IsNotEmpty()
    @IsNumber()
    id: number;
}
