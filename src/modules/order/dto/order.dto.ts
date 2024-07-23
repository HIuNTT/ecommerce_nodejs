import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { GetAddressDTO } from './address.dto';
import { Type } from 'class-transformer';
import { GetVoucherDTO } from '~/modules/voucher/dto';
import { GetPaymentMethodDTO } from './payment-method.dto';
import { BaseInfiniteScroll } from '~/interfaces';
import { GetOrderStatus } from './get-order-status.dto';
import { GetOrderItem } from './order-item.dto';
import { Decimal } from '@prisma/client/runtime/library';

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
    @Type(() => GetAddressDTO)
    address: GetAddressDTO;

    @IsOptional()
    @Type(() => GetVoucherDTO)
    voucher?: GetVoucherDTO;

    @IsNotEmpty({ message: 'Please select payment method' })
    @Type(() => GetPaymentMethodDTO)
    paymentMethod: GetPaymentMethodDTO;

    @IsNotEmpty()
    @IsArray()
    @Type(() => CreateOrderItemDTO)
    items: CreateOrderItemDTO[];
}

export class GetOrder {
    id: string;
    totalPrice: number | Decimal;
    orderStatus: GetOrderStatus;
    items: GetOrderItem[];
}

export class OrderInfiniteScroll extends BaseInfiniteScroll {
    ordersList: GetOrder[] | null;
}

export class CancelOrderDTO {
    @IsNotEmpty()
    @IsString()
    orderId: string;
}
