import { IsNotEmpty, IsNumber } from 'class-validator';

export class PaymentMethodDTO {
    @IsNotEmpty()
    @IsNumber()
    id: number;
}

export class GetPaymentMethodDTO {
    id: number;
    name: string;
}
