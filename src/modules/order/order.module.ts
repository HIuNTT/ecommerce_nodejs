import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderStatusController } from './controllers/order-status.controller';
import { OrderStatusService } from './services/order-status.service';

@Module({
    controllers: [OrderController, OrderStatusController],
    providers: [OrderService, OrderStatusService],
    exports: [OrderService],
})
export class OrderModule {}
