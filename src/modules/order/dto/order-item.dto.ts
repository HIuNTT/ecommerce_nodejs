import { Decimal } from '@prisma/client/runtime/library';
import { GetItemOfOrder } from '~/modules/item/dto/item.dto';

export class GetOrderItem {
    quantity: number;
    price: number | Decimal;
    item: GetItemOfOrder;
}
