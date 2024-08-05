import { Injectable } from '@nestjs/common';
import { PrismaService } from '~/shared/prisma/prisma.service';
import { GetOrderStatusAdminDTO } from '../dto/get-order-status.dto';
import { CreateOrderStatusDTO } from '../dto/order-status.dto';
import { OrderService } from '../order.service';

@Injectable()
export class OrderStatusService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly orderService: OrderService,
    ) {}

    async getListOrderStatus(): Promise<GetOrderStatusAdminDTO[]> {
        return await this.prisma.orderStatus.findMany();
    }

    async createOrderStatus(payload: CreateOrderStatusDTO): Promise<void> {
        await this.prisma.orderStatus.create({
            data: {
                ...payload,
            },
        });
    }

    async updateOrderStatus(orderStatusId: number, payload: CreateOrderStatusDTO): Promise<void> {
        await this.prisma.orderStatus.update({
            where: {
                id: orderStatusId,
            },
            data: {
                ...payload,
            },
        });
    }

    async deleteOrderStatus(orderStatusId: number): Promise<void> {
        const order = await this.orderService.findOrderByStatusId(orderStatusId);

        if (order) {
            throw new Error('Cannot delete order status while it is used in an order');
        }

        await this.prisma.orderStatus.delete({
            where: {
                id: orderStatusId,
            },
        });
    }
}
