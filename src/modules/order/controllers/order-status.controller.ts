import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Put, UseGuards } from '@nestjs/common';
import { OrderStatusService } from '../services/order-status.service';
import { AccessTokenGuard } from '~/modules/auth/guards';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '~/modules/auth/guards/roles.guard';
import { ApiResult, IdParam, Roles } from '~/decorators';
import { ROLE } from '~/enums/role.enum';
import { GetOrderStatusAdminDTO } from '../dto/get-order-status.dto';
import { CreateOrderStatusDTO, UpdateOrderStatusDTO } from '../dto/order-status.dto';

@ApiTags('Order Status - Trạng thái đơn hàng')
@Controller('order/status')
@UseGuards(AccessTokenGuard)
export class OrderStatusController {
    constructor(private readonly orderStatusService: OrderStatusService) {}

    @Get()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Danh sách trạng thái đơn hàng' })
    @ApiResult({ type: [GetOrderStatusAdminDTO] })
    async list(): Promise<GetOrderStatusAdminDTO[]> {
        return await this.orderStatusService.getListOrderStatus();
    }

    async detail() {}

    @Post('create')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Thêm trạng thái đơn hàng mới', description: 'Chỉ admin mới có quyền' })
    @Roles(ROLE.ADMIN, ROLE.MANAGER)
    @UseGuards(RolesGuard)
    @HttpCode(HttpStatus.OK)
    async create(@Body() payload: CreateOrderStatusDTO): Promise<void> {
        await this.orderStatusService.createOrderStatus(payload);
    }

    @Put('update/:id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Cập nhật trạng thái đơn hàng', description: 'Chỉ admin mới có quyền' })
    @Roles(ROLE.ADMIN, ROLE.MANAGER)
    @UseGuards(RolesGuard)
    async update(@Body() payload: UpdateOrderStatusDTO, @IdParam() orderStatusId: number): Promise<void> {
        await this.orderStatusService.updateOrderStatus(orderStatusId, payload);
    }

    @Delete('delete/:id')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Xóa trạng thái đơn hàng',
        description: 'Chỉ admin mới có quyền, và chưa có đơn hàng nào ở trạng thái này thì mới được xóa',
    })
    @Roles(ROLE.ADMIN, ROLE.MANAGER)
    @UseGuards(RolesGuard)
    async delete(@IdParam() orderStatusId: number): Promise<void> {
        await this.orderStatusService.deleteOrderStatus(orderStatusId);
    }
}
