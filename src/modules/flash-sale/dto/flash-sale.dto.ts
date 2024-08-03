import {
    IsArray,
    IsBoolean,
    IsEnum,
    IsInt,
    IsISO8601,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Max,
    Min,
} from 'class-validator';
import { CreateFlashSaleItemDTO, GetFlashSaleDetailItemDTO } from './flash-sale-item.dto';
import { Transform, Type } from 'class-transformer';
import { PagerDTO } from '~/interfaces/pager.dto';
import { FLASHSALE_STATUS } from '~/enums/status.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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

export class GetFlashSaleDetailDTO {
    id: number;
    name: string;
    startTime: Date;
    endTime: Date;
    isActived: boolean;
    createdAt: Date;
    updatedAt: Date;

    @ApiProperty({ type: [GetFlashSaleDetailItemDTO] })
    items: GetFlashSaleDetailItemDTO[];
}

export class FlashSaleQueryDTO extends PagerDTO {
    @ApiPropertyOptional({ enum: FLASHSALE_STATUS })
    @IsEnum(FLASHSALE_STATUS)
    @IsOptional()
    status?: FLASHSALE_STATUS;

    @ApiPropertyOptional({ minimum: 1, maximum: 50, default: 5 })
    @IsOptional({ always: true })
    @Min(1)
    @Max(50)
    @IsInt()
    // Transform: khi có truyền limit, nhưng rỗng (limit=) thì sẽ áp dụng chuyển đổi, gán = giá trị mặc định
    @Transform(({ value: val }) => (val ? Number.parseInt(val) : 5), {
        toClassOnly: true,
    })
    limit?: number = 5;

    @ApiPropertyOptional({ description: 'Trạng thái bật/tắt của chương trình flash sale' })
    @IsOptional()
    @IsBoolean()
    actived?: boolean;
}

export class GetFlashSaleDTO {
    id: number;
    name: string;
    startTime: Date;
    endTime: Date;
    isActived: boolean;
    createdAt: Date;
    updatedAt: Date;
    _count: {
        items: number;
    };
    status?: FLASHSALE_STATUS;
}
