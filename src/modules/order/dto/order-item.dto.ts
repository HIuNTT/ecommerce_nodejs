import { ApiProperty } from '@nestjs/swagger';

export class GetOrderItemDTO {
    @ApiProperty({ description: 'Mã sản phẩm' })
    id: string;
    name: string;
    thumbnail: string;
    oldPrice: number;
    price: number;
    quantity: number;
}

export class GetOrderItemAdminDTO {
    id: string;
    name: string;
    thumbnail: string;
    quantity: number;
}
