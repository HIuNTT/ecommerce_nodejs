import { ArrayNotEmpty, IsArray, IsNotEmpty, IsNumber, IsObject, IsOptional } from 'class-validator';
import { GetAddressDTO } from './address.dto';
import { Type } from 'class-transformer';
import { GetVoucherDTO } from '~/modules/voucher/dto';
import { GetPaymentMethodDTO } from './payment-method.dto';

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
