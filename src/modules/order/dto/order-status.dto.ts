import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ORDER_STATUS } from '~/enums/status.enum';

export class CreateOrderStatusDTO {
    @ApiProperty({ description: 'Tên trạng thái đơn hàng', example: ORDER_STATUS.PENDING })
    @IsEnum(ORDER_STATUS)
    name: ORDER_STATUS;
}

export class UpdateOrderStatusDTO extends CreateOrderStatusDTO {}
