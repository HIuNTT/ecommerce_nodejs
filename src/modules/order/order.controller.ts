import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { CancelOrderDTO, CreateOrderDTO } from './dto/order.dto';
import { UserId } from '~/decorators';
import { AccessTokenGuard } from '../auth/guards';
import { Filters } from '~/interfaces';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Order - Đơn hàng')
@Controller('order')
@UseGuards(AccessTokenGuard)
export class OrderController {
    constructor(private readonly orderService: OrderService) {}

    @Post('create')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Tạo đơn hàng, đặt mua hàng' })
    @HttpCode(HttpStatus.OK)
    async create(@Body() body: CreateOrderDTO, @UserId() userId: string): Promise<void> {
        return await this.orderService.createOrder(body, userId);
    }

    @Get('get-order-detail')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Người dùng xem chi tiết đơn hàng của bản thân' })
    async getDetailById(@UserId() userId: string, @Query('orderId') orderId: string) {
        return await this.orderService.getOrderDetailById(orderId, userId);
    }

    @Get('get-order-list')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Người dùng xem danh sách đơn hàng của bản thân' })
    async getAll(@UserId() userId: string, @Query() filter: Filters) {
        return await this.orderService.getListOrdersUser(userId, filter);
    }

    @Post('cancel')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Người dùng hủy đơn hàng' })
    @HttpCode(HttpStatus.OK)
    async cancel(@UserId() userId: string, @Body() cancelReq: CancelOrderDTO): Promise<void> {
        await this.orderService.cancelOrder(userId, cancelReq);
    }
}
