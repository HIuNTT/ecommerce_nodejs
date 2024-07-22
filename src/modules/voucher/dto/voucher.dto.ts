import { IsIn, IsISO8601, IsNotEmpty, IsNumber, IsOptional, Matches, Max, Min } from 'class-validator';

export class CreateVoucherDTO {
    @IsNotEmpty()
    @Matches(/^[A-Z0-9]{1,9}$/, { message: 'Vui lòng chỉ nhập các kí tự chữ cái (A-Z), số (0-9); tối đa 9 kí tự.' })
    voucherCode: string;

    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    @IsNumber()
    minSpend: number;

    @IsOptional()
    @IsNumber()
    discountCap?: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(100)
    discountPercentage?: number;

    @IsOptional()
    @IsNumber()
    @Min(1000)
    @Max(120000000)
    discountValue?: number;

    @IsNotEmpty()
    @IsNumber()
    @IsIn([1, 2, 3, 4, 5])
    usageLimitPerUser: number;

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    @Max(200000)
    maxCount: number;

    @IsNotEmpty()
    @IsISO8601()
    startTime: string;

    @IsNotEmpty()
    @IsISO8601()
    endTime: string;
}

export class UpdateVoucherDTO extends CreateVoucherDTO {
    @IsNotEmpty()
    @IsNumber()
    id: number;
}

export class GetVoucherDTO {
    @IsNotEmpty()
    @IsNumber()
    id: number;
}
