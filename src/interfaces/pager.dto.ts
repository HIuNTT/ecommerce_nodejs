import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export enum Order {
    ASC = 'asc',
    DESC = 'desc',
}

export class PagerDTO {
    @ApiPropertyOptional({ minimum: 1, maximum: 50, default: 10 })
    @IsOptional({ always: true })
    @Min(1)
    @Max(50)
    @IsInt()
    // Transform: khi có truyền limit, nhưng rỗng (limit=) thì sẽ áp dụng chuyển đổi, gán = giá trị mặc định
    @Transform(({ value: val }) => (val ? Number.parseInt(val) : 10), {
        toClassOnly: true,
    })
    limit?: number = 10;

    @ApiPropertyOptional({ minimum: 1, default: 1 })
    @Min(1)
    @IsInt()
    @IsOptional({ always: true })
    @Transform(({ value: val }) => (val ? Number.parseInt(val) : 1), {
        toClassOnly: true,
    })
    page?: number = 1;

    @ApiPropertyOptional({ description: 'Sắp xếp theo trường nào' })
    @IsString()
    @IsOptional()
    sortBy?: string;

    @ApiPropertyOptional({ enum: Order })
    @IsEnum(Order)
    @IsOptional()
    @Transform(({ value }) => (value === 'asc' ? Order.ASC : Order.DESC))
    order?: Order;

    get skip(): number {
        return (this.page - 1) * this.limit;
    }
}
