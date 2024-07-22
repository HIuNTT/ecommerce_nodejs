import { IsNotEmpty, IsNumber } from 'class-validator';

export class GetPaymentMethodDTO {
    @IsNotEmpty()
    @IsNumber()
    id: number;
}
