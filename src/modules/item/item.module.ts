import { Module } from '@nestjs/common';
import { ItemController } from './item.controller';
import { ItemService } from './item.service';
import { OrderModule } from '../order/order.module';

@Module({
    imports: [OrderModule],
    controllers: [ItemController],
    providers: [ItemService],
})
export class ItemModule {}
