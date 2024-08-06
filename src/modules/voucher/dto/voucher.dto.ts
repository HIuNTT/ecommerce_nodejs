import { ApiProperty, ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime/library';
import { IsIn, IsISO8601, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, Max, Min } from 'class-validator';
import { VOUCHER_STATUS } from '~/enums/status.enum';
import { PagerDTO } from '~/interfaces/pager.dto';

export class CreateVoucherDTO {
    @ApiProperty({ description: 'Mã voucher', example: 'SHOP12345' })
    @IsNotEmpty()
    @Matches(/^[A-Z0-9]{1,9}$/, { message: 'Vui lòng chỉ nhập các kí tự chữ cái (A-Z), số (0-9); tối đa 9 kí tự.' })
    voucherCode: string;

    @ApiProperty({ description: 'Tên voucher, chỉ hiện với admin', example: 'Hot Sale' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ description: 'Đơn giá tối thiểu để được apply voucher', default: 0 })
    @IsNotEmpty()
    @IsNumber()
    minSpend: number;

    @ApiPropertyOptional({ description: 'Giảm tối đa', example: 100000 })
    @IsOptional()
    @IsNumber()
    discountCap?: number | null;

    @ApiPropertyOptional({ description: 'Phần trăm giảm giá, nên < 69%', example: 20, maximum: 100, minimum: 1 })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(100)
    discountPercentage?: number | null;

    @ApiPropertyOptional({ description: 'Giá trị giảm giá', example: 100000, minimum: 1000, maximum: 120000000 })
    @IsOptional()
    @IsNumber()
    @Min(1000)
    @Max(120000000)
    discountValue?: number | null;

    @ApiProperty({ description: 'Số lần dùng tối đa trên mỗi user', default: 1, minimum: 1, maximum: 5 })
    @IsNotEmpty()
    @IsNumber()
    @IsIn([1, 2, 3, 4, 5])
    usageLimitPerUser: number;

    @ApiProperty({ description: 'Số lượng voucher', example: 10, minimum: 1, maximum: 200000, default: 1 })
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    @Max(200000)
    maxCount: number;

    @ApiProperty({ description: 'Thời gian bắt đầu', example: '2024-08-01 00:00:00' })
    @IsNotEmpty()
    @IsISO8601()
    startTime: string;

    @ApiProperty({ description: 'Thời gian kết thúc', example: '2024-08-31 23:59:59' })
    @IsNotEmpty()
    @IsISO8601()
    endTime: string;
}

export class UpdateVoucherDTO extends PartialType(OmitType(CreateVoucherDTO, ['voucherCode'] as const)) {
    @ApiProperty({ description: 'Id voucher' })
    @IsNotEmpty()
    @IsNumber()
    id: number;
}

export class GetVoucherUserDTO {
    id: number;
    voucherCode: string;
    name: string;
    minSpend: Decimal;
    discountCap: Decimal | null;
    discountPercentage: number | null;
    discountValue: Decimal | null;
    usageLimitPerUser: number;
    maxCount: number;
    usedCount: number;
    startTime: Date;
    endTime: Date;
    remainingUsageLimit: number;
    createdAt: Date;
    updatedAt: Date;
}

export class GetVoucherAdminDTO extends OmitType(GetVoucherUserDTO, ['remainingUsageLimit'] as const) {
    status?: VOUCHER_STATUS;
}

export class GetVoucherDetailDTO extends OmitType(GetVoucherUserDTO, ['remainingUsageLimit', 'usedCount'] as const) {}
export class GetVoucherDTO {
    @IsNotEmpty()
    @IsNumber()
    id: number;
}

export class VoucherQueryDTO extends OmitType(PagerDTO, ['sortBy', 'order'] as const) {
    @ApiPropertyOptional({ description: 'Từ khóa tìm kiếm: tìm theo tên voucher hoặc mã voucher (không phải id)' })
    @IsOptional()
    @IsString()
    search?: string;
}
