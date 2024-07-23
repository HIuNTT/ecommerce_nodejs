import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { CancelOrderDTO, CreateOrderDTO } from './dto/order.dto';
import { UserId } from '~/decorators';
import { AccessTokenGuard } from '../auth/guards';
import { Filters } from '~/interfaces';

@Controller('order')
@UseGuards(AccessTokenGuard)
export class OrderController {
    constructor(private readonly orderService: OrderService) {}

    @Post('create')
    @HttpCode(HttpStatus.OK)
    async create(@Body() body: CreateOrderDTO, @UserId() userId: string) {
        return await this.orderService.createOrder(body, userId);
    }

    @Get('get-order-detail')
    async getDetailById(@UserId() userId: string, @Query('orderId') orderId: string) {
        return await this.orderService.getOrderDetailById(orderId, userId);
    }

    @Get('get-order-list')
    async getAll(@UserId() userId: string, @Query() filter: Filters) {
        return await this.orderService.getListOrdersUser(userId, filter);
    }

    @Post('cancel')
    @HttpCode(HttpStatus.OK)
    async cancel(@UserId() userId: string, @Body() cancelReq: CancelOrderDTO): Promise<void> {
        await this.orderService.cancelOrder(userId, cancelReq);
    }
}
