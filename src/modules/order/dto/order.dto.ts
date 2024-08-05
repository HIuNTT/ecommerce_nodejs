import { IsArray, IsInt, IsISO8601, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { GetVoucherDTO } from '~/modules/voucher/dto';
import { GetPaymentMethodDTO, PaymentMethodDTO } from './payment-method.dto';
import { GetOrderStatus } from './get-order-status.dto';
import { GetOrderItemAdminDTO, GetOrderItemDTO } from './order-item.dto';
import { PagerDTO } from '~/interfaces/pager.dto';
import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { GetOrderUserDTO } from '~/modules/user/dto/user.dto';
import { OrderAddressDTO } from '~/modules/auth/dto';

export class CreateOrderItemDTO {
    @IsNotEmpty()
    @IsNumber()
    itemId: number;

    @IsNotEmpty()
    @IsNumber()
    quantity: number;
}

export class CreateOrderDTO {
    @IsOptional()
    note?: string;

    @IsNotEmpty({ message: 'Please select address' })
    @Type(() => OrderAddressDTO)
    address: OrderAddressDTO;

    @IsOptional()
    @Type(() => GetVoucherDTO)
    voucher?: GetVoucherDTO;

    @IsNotEmpty({ message: 'Please select payment method' })
    @Type(() => PaymentMethodDTO)
    paymentMethod: PaymentMethodDTO;

    @IsNotEmpty()
    @IsArray()
    @Type(() => CreateOrderItemDTO)
    items: CreateOrderItemDTO[];
}

export class CancelOrderDTO {
    @IsNotEmpty()
    @IsString()
    orderId: string;
}

export class OrderQueryDTO extends PagerDTO {
    @ApiPropertyOptional({
        minimum: 0,
        maximum: 8,
        default: 0,
        description: 'Lọc theo trạng thái đơn hàng. VD: 0: All, 1: Pending,... 8: Failed',
    })
    @Min(0)
    @Max(8)
    @IsInt()
    @IsOptional()
    type?: number;

    @ApiPropertyOptional({ description: 'Tìm kiếm bằng keyword' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ description: 'Tìm kiếm theo trường nào. VD: 1: Tên sản phẩm, 2: Tên người mua' })
    @IsOptional()
    @IsInt()
    searchBy?: number;

    @ApiPropertyOptional({ description: 'Từ ngày', example: '2024-08-01 00:00:00' })
    @IsOptional()
    @IsISO8601()
    from?: string;

    @ApiPropertyOptional({ description: 'Đến ngày', example: '2024-08-30 23:59:59' })
    @IsOptional()
    @IsISO8601()
    to?: string;
}

export class GetOrderAdminDTO {
    @ApiProperty({ description: 'Id đơn hàng' })
    id: string;

    @ApiProperty({ description: 'Người mua', type: GetOrderUserDTO })
    user: GetOrderUserDTO;

    @ApiProperty({ description: 'Trạng thái đơn hàng', type: GetOrderStatus })
    orderStatus: GetOrderStatus;

    @ApiProperty({ description: 'Danh sách sản phẩm', type: [GetOrderItemAdminDTO] })
    items: GetOrderItemAdminDTO[];

    @ApiProperty({ description: 'Tin nhắn từ người mua' })
    note: string | null;

    @ApiProperty({ description: 'Tổng tiền' })
    totalPrice: number;

    @ApiProperty({ description: 'Ngày tạo đơn' })
    createdAt: Date;
}

export class GetOrderDTO extends OmitType(GetOrderAdminDTO, ['items', 'user', 'note'] as const) {
    items: GetOrderItemDTO[];
}

export class OrderUserQueryDTO extends OmitType(PagerDTO, ['order', 'sortBy'] as const) {
    @ApiPropertyOptional({
        minimum: 0,
        maximum: 8,
        default: 0,
        description: 'Lọc theo trạng thái đơn hàng. VD: 0: All, 1: Pending,... 8: Failed',
    })
    @Min(0)
    @Max(8)
    @IsInt()
    @IsOptional()
    type?: number;
}

export class GetOrderDetailDTO {
    id: string;
    recipientName: string;
    recipientPhone: string;
    recipientAddress: string;
    note: string | null;
    orderStatus: GetOrderStatus;

    @ApiProperty({ type: [GetOrderItemDTO] })
    items: GetOrderItemDTO[];
    paymentMethod: GetPaymentMethodDTO;
    voucherPrice: number;
    totalPrice: number;
    createdAt: Date;
}
