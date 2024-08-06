import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import {
    CancelOrderDTO,
    CreateOrderDTO,
    GetOrderAdminDTO,
    GetOrderDetailDTO,
    GetOrderDTO,
    OrderQueryDTO,
    OrderUserQueryDTO,
    RefundOrderDTO,
    SetOrderStatusDTO,
} from './dto/order.dto';
import { ApiResult, Roles, UserId } from '~/decorators';
import { AccessTokenGuard } from '../auth/guards';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ROLE } from '~/enums/role.enum';
import { Pagination } from '~/helpers/paginate/pagination';
import { UpdateOrderStatusDTO } from './dto/order-status.dto';

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
        await this.orderService.createOrder(body, userId);
    }

    @Get('get-order-detail')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Người dùng xem chi tiết đơn hàng của bản thân' })
    @ApiResult({ type: GetOrderDetailDTO })
    async getDetailById(@UserId() userId: string, @Query() orderId: string): Promise<GetOrderDetailDTO> {
        return await this.orderService.getOrderDetailById(orderId, userId);
    }

    @Get('get-order-list')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Người dùng xem danh sách đơn hàng của bản thân',
        description: `
Lọc theo trạng thái đơn hàng (dùng biến type):

* type = 0: All (Tất cả)
* type = 1: Pending (Chờ xác nhận)
* type = 2: Confirmed (Đã xác nhận)
* type = 3: Preparing (Đang chuẩn bị hàng)
* type = 4: Shipping (Đang giao hàng)
* type = 5: Delivered (Đã giao hàng)
* type = 6: Cancelled (Đã hủy đơn)
* type = 7: Returned_Refund (Đã trả hàng/Đã hoàn tiền)
* type = 8: Failed (Thất bại, do thất lạc hàng,...)`,
    })
    @ApiResult({ type: [GetOrderDTO], isPage: true })
    async getAll(@UserId() userId: string, @Query() query: OrderUserQueryDTO): Promise<Pagination<GetOrderDTO>> {
        return await this.orderService.getListOrdersUser(userId, query);
    }

    @Post('cancel')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Người dùng hủy đơn hàng',
        description: 'Nếu hủy đơn hàng thì cần hoàn lại voucher đã dùng bởi user (coi như chưa dùng voucher này)',
    })
    @HttpCode(HttpStatus.OK)
    async cancel(@UserId() userId: string, @Body() cancelReq: CancelOrderDTO): Promise<void> {
        await this.orderService.cancelOrder(userId, cancelReq);
    }

    @Post('refund')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Người dùng yêu cầu trả hàng/hoàn tiền',
        description: 'Chỉ những đơn hàng đã được giao mới được yêu cầu hoàn tiền/trả hàng',
    })
    @HttpCode(HttpStatus.OK)
    async refund(@UserId() userId: string, @Body() refundReq: RefundOrderDTO): Promise<void> {
        await this.orderService.refundOrder(userId, refundReq);
    }

    @Get()
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Danh sách đơn hàng (Trang admin)',
        description: `
Lọc theo ngày tạo đơn, từ ngày... đến ngày...

Lọc theo voucher

Lọc theo trạng thái đơn hàng (dùng biến type):

* type = 0: All (Tất cả)
* type = 1: Pending (Chờ xác nhận)
* type = 2: Confirmed (Đã xác nhận)
* type = 3: Preparing (Đang chuẩn bị hàng)
* type = 4: Shipping (Đang giao hàng)
* type = 5: Delivered (Đã giao hàng)
* type = 6: Cancelled (Đã hủy đơn)
* type = 7: Returned_Refund (Đã trả hàng/Đã hoàn tiền)
* type = 8: Failed (Thất bại, do thất lạc hàng,...)`,
    })
    @ApiResult({ type: [GetOrderAdminDTO], isPage: true })
    @Roles(ROLE.ADMIN, ROLE.MANAGER)
    @UseGuards(RolesGuard)
    async list(@Query() query: OrderQueryDTO): Promise<Pagination<GetOrderAdminDTO>> {
        return await this.orderService.getOrders(query);
    }

    @Post('update-status')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Admin cập nhật trạng thái đơn hàng' })
    @Roles(ROLE.ADMIN, ROLE.MANAGER)
    @UseGuards(RolesGuard)
    @HttpCode(HttpStatus.OK)
    async updateStatus(@Body() payload: SetOrderStatusDTO): Promise<void> {
        await this.orderService.updateOrderStatus(payload);
    }
}
