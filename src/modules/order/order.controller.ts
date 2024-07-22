import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDTO } from './dto/order.dto';
import { UserId } from '~/decorators';
import { AccessTokenGuard } from '../auth/guards';

@Controller('order')
export class OrderController {
    constructor(private readonly orderService: OrderService) {}

    @Post('create')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AccessTokenGuard)
    async create(@Body() body: CreateOrderDTO, @UserId() userId: string) {
        return await this.orderService.createOrder(body, userId);
    }
}
