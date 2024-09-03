import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '~/shared/prisma/prisma.service';
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
import dayjs from 'dayjs';
import { Order, OrderItem } from '@prisma/client';
import { isEmpty } from 'lodash';
import { createPagination } from '~/helpers/paginate/create-pagination';
import { Pagination } from '~/helpers/paginate/pagination';
import { ORDER_STATUS } from '~/enums/status.enum';

async function formatResult(result: any): Promise<GetOrderDetailDTO> {
    return {
        ...result,
        items: result.items.map((e: any) => ({
            ...e.item,
            price: e.price,
            quantity: e.quantity,
        })),
    };
}
@Injectable()
export class OrderService {
    constructor(private readonly prisma: PrismaService) {}

    async createOrder(body: CreateOrderDTO, userId: string): Promise<void> {
        const { voucher, items, address, note, paymentMethod } = body;

        const orderItems: Omit<OrderItem, 'orderId' | 'createdAt' | 'updatedAt'>[] = [];
        let totalPrice = 0;

        // Duyệt toàn bộ list sản phẩm trong đơn hàng
        for (const item of items) {
            const product = await this.prisma.item.findUnique({
                where: {
                    id: item.itemId,
                    isActived: true,
                },
                include: {
                    flashSales: {
                        where: {
                            flashSale: {
                                startTime: {
                                    lte: dayjs().toISOString(),
                                },
                                endTime: {
                                    gte: dayjs().toISOString(),
                                },
                            },
                        },
                        include: {
                            flashSale: true,
                        },
                    },
                },
            });
            console.log(1);
            if (!product) {
                throw new NotFoundException('Not found item');
            }
            // Kiểm tra xem sản phẩm còn hàng không
            if (product.stock < item.quantity) {
                throw new BadRequestException(`Item ${product.name} is out of stock`);
            }
            console.log('Stock check passed');
            // Kiểm tra xem sản phẩm thuộc flash sale còn đủ số lượng không
            if (
                !isEmpty(product.flashSales) &&
                product.flashSales[0].quantity &&
                product.flashSales[0].sold + item.quantity > product.flashSales[0].quantity
            ) {
                throw new BadRequestException(`Item ${product.name} flash sale is not in enough stock`);
            }
            console.log('Flash sale stock check passed');

            let isOrderLimited = false;
            // Kiểm tra xem user đã đặt giới hạn đặt hàng sản phẩm flash sale chưa
            if (product.flashSales[0]?.orderLimit) {
                // Lấy ra tất cả order item của user mà có sp hiện đang xét, và nó thuộc flash sale đang ongoing
                const userOrderItems = await this.prisma.orderItem.findMany({
                    where: {
                        itemId: item.itemId,
                        Order: {
                            userId,
                            items: {
                                some: {
                                    itemId: item.itemId,
                                },
                            },
                            createdAt: {
                                gte: product.flashSales[0].flashSale.startTime,
                                lte: product.flashSales[0].flashSale.endTime,
                            },
                        },
                    },
                });

                if (userOrderItems) {
                    // Đếm tổng số lượng sản phẩm đang xét thuộc flash sale mà user đã đặt mua
                    const userOrderItemCount = userOrderItems.reduce(
                        (acc, userOrderItem) => acc + userOrderItem.quantity,
                        0,
                    );
                    // Kiểm tra xem sản phẩm đang xét có số lượng quantity vượt quá giới hạn đặt hàng flash sale không?
                    // Nếu mua nhiều hơn số lượng giới hạn (orderLimit) thì đơn giá sẽ về giá bình thường
                    if (userOrderItemCount + item.quantity > product.flashSales[0].orderLimit) {
                        isOrderLimited = true; // = true tức là đã đặt giới hạn, quay về giá bình thường
                        console.log(`Item ${product.name} has reached its order limit`);
                    }
                } else {
                    // Nếu user chưa mua sản phẩm này trong flash sale, thì kiếm tra nếu số lượng đặt mua lớn hơn order limit thì quay về giá thường
                    if (item.quantity > product.flashSales[0].orderLimit) isOrderLimited = true;
                    console.log(`Order limit has been exceeded`);
                }
            }

            const unitPrice =
                !isEmpty(product.flashSales) && !isOrderLimited ? product.flashSales[0].discountedPrice : product.price;
            orderItems.push({
                itemId: item.itemId,
                quantity: item.quantity,
                price: unitPrice,
            });

            totalPrice += unitPrice.toNumber() * item.quantity; // Tính tổng tiền của đơn hàng
        }

        let voucherDiscountedPrice = 0;

        let checkVoucher = false;
        if (voucher) {
            const voucherData = await this.prisma.voucher.findUnique({
                where: {
                    id: voucher.id,
                },
                select: {
                    minSpend: true,
                    endTime: true,
                    maxCount: true,
                    usedCount: true,
                    discountCap: true,
                    discountValue: true,
                    discountPercentage: true,
                },
            });

            if (!voucherData) {
                throw new BadRequestException('Invalid voucher');
            }
            if (dayjs(voucherData.endTime).isBefore(dayjs())) {
                throw new BadRequestException('Voucher has expired');
            }

            if (voucherData.usedCount === voucherData.maxCount) {
                throw new BadRequestException('Voucher is out of stock');
            }

            if (totalPrice >= voucherData.minSpend.toNumber()) {
                if (voucherData.discountPercentage && voucherData.discountCap) {
                    voucherDiscountedPrice = Math.min(
                        voucherData.discountCap.toNumber(),
                        totalPrice * (voucherData.discountPercentage / 100),
                    );
                } else if (voucherData.discountValue) {
                    voucherDiscountedPrice = voucherData.discountValue.toNumber();
                }
                checkVoucher = true;
                console.log(totalPrice);
            }
            totalPrice -= voucherDiscountedPrice;
        }

        this.prisma.$transaction(async (prisma) => {
            // 1. Tạo order của user
            const order = await prisma.order.create({
                data: {
                    note,
                    recipientName: address.fullname,
                    recipientPhone: address.phone,
                    recipientAddress: [address.address, address.commune, address.district, address.province].join(', '),
                    totalPrice,
                    voucherPrice: voucherDiscountedPrice,
                    user: {
                        connect: {
                            id: userId,
                        },
                    },
                    voucher: voucher && {
                        connect: {
                            id: voucher.id,
                        },
                    },
                    paymentMethod: {
                        connect: {
                            id: paymentMethod.id,
                        },
                    },
                    orderStatus: {
                        connect: {
                            name: 'PENDING',
                        },
                    },
                    items: {
                        create: orderItems.map((orderItem) => orderItem),
                    },
                },
            });

            // 2. Cập nhật số lượng đã dùng của Voucher
            if (checkVoucher) {
                const voucherData = await prisma.voucher.update({
                    where: {
                        id: voucher.id,
                    },
                    data: {
                        usedCount: {
                            increment: 1,
                        },
                        vouchersUser: {
                            upsert: {
                                create: {
                                    quantity: 1,
                                    user: {
                                        connect: {
                                            id: userId,
                                        },
                                    },
                                },
                                update: {
                                    quantity: {
                                        increment: 1,
                                    },
                                },
                                where: {
                                    voucherId_userId: {
                                        userId,
                                        voucherId: voucher.id,
                                    },
                                },
                            },
                        },
                    },
                    include: {
                        vouchersUser: true,
                    },
                });

                // Kiểm tra xem user đã dùng voucher quá số lần cho phép chưa
                if (voucherData.vouchersUser[0].quantity > voucherData.usageLimitPerUser) {
                    throw new BadRequestException('Voucher has reached its usage limit per user');
                }

                // Kiểm tra xem đủ voucher để dùng không?
                if (voucherData.usedCount > voucherData.maxCount) {
                    throw new BadRequestException('Voucher is out of stock');
                }
            }

            // 3. Cập nhật số lượng sản phẩm trong kho và số lượng đã bán của sản phẩm thuộc flash sale
            const updateItems = orderItems.map(async (orderItem) => {
                const product = await this.prisma.item.findUnique({
                    where: {
                        id: orderItem.itemId,
                        isActived: true,
                    },
                    include: {
                        flashSales: {
                            where: {
                                flashSale: {
                                    startTime: {
                                        lte: dayjs().toISOString(),
                                    },
                                    endTime: {
                                        gte: dayjs().toISOString(),
                                    },
                                },
                            },
                        },
                    },
                });

                let flashSaleId = 0;
                if (product?.flashSales.length > 0) {
                    flashSaleId = product.flashSales[0].flashSaleId;
                }

                const updateItem = await prisma.item.update({
                    where: {
                        id: orderItem.itemId,
                    },
                    data: {
                        stock: {
                            decrement: orderItem.quantity,
                        },
                        flashSales: flashSaleId
                            ? {
                                  update: {
                                      where: {
                                          flashSaleId_itemId: {
                                              flashSaleId,
                                              itemId: orderItem.itemId,
                                          },
                                      },
                                      data: {
                                          sold: {
                                              increment: orderItem.quantity,
                                          },
                                      },
                                  },
                              }
                            : {},
                    },
                });

                // Kiểm tra xem sản phẩm đã hết hàng chưa
                if (updateItem.stock < 0) {
                    throw new BadRequestException(`Item ${updateItem.name} is out of stock`);
                }
            });

            await Promise.all(updateItems);
            return order;
        });
    }

    // Người dùng xem chi tiết đơn hàng
    async getOrderDetailById(orderId: string, userId: string): Promise<GetOrderDetailDTO> {
        const order = await this.prisma.order.findUnique({
            where: {
                id: orderId,
                user: {
                    id: userId,
                },
            },
            select: {
                id: true,
                recipientName: true,
                recipientPhone: true,
                recipientAddress: true,
                note: true,
                orderStatus: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                items: {
                    select: {
                        item: {
                            select: {
                                id: true,
                                name: true,
                                thumbnail: true,
                                oldPrice: true,
                            },
                        },
                        price: true,
                        quantity: true,
                    },
                },
                paymentMethod: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                voucherPrice: true,
                totalPrice: true,
                createdAt: true,
            },
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        return formatResult(order);
    }

    // Lấy ra danh sách đơn hàng của user, có lọc status đơn hàng qua param TYPE (mã status)
    async getListOrdersUser(userId: string, query: OrderUserQueryDTO): Promise<Pagination<GetOrderDTO>> {
        const { page, limit, type, skip } = query; // Nếu không có type thì mặc định lấy ra tất cả đơn hàng mà không lọc status
        const [orders, totalCount] = await Promise.all([
            this.prisma.order.findMany({
                where: {
                    userId,
                    ...(type && { orderStatusId: type }),
                },
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc',
                },
                select: {
                    id: true,
                    orderStatus: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    items: {
                        select: {
                            item: {
                                select: {
                                    id: true,
                                    name: true,
                                    thumbnail: true,
                                    oldPrice: true,
                                },
                            },
                            price: true,
                            quantity: true,
                        },
                    },
                    totalPrice: true,
                },
            }),
            this.prisma.order.count({
                where: {
                    userId,
                    ...(type && { orderStatusId: type }),
                },
            }),
        ]);

        return createPagination<GetOrderDTO>({
            items: await Promise.all(orders.map((order) => formatResult(order))),
            currentPage: page,
            limit,
            totalCount,
        });
    }

    async cancelOrder(userId: string, { orderId }: CancelOrderDTO): Promise<void> {
        const order = await this.findOrderById(orderId);
        if (!order) {
            throw new NotFoundException('Order not found');
        }

        // Chỉ các đơn hàng đang trong trạng thái PENDING, CONFIRMED, PREPARING mới được hủy đơn hàng
        if (order.orderStatusId in [1, 2, 3]) {
            await this.prisma.order.update({
                where: {
                    id: orderId,
                    userId,
                    orderStatusId: {
                        in: [1, 2, 3],
                    },
                },
                data: {
                    orderStatusId: 6, // 6 là status CANCELLED
                },
            });

            // Nếu hủy đơn hàng thì cần hoàn lại voucher đã dùng bởi user
            await this.prisma.voucherUsed.delete({
                where: {
                    voucherId_userId: {
                        voucherId: order.voucherId,
                        userId,
                    },
                },
            });
        } else {
            throw new BadRequestException('Order is not in a valid status to cancel');
        }
    }

    async refundOrder(userId: string, { orderId }: RefundOrderDTO): Promise<void> {
        const order = await this.prisma.order.findUnique({
            where: {
                id: orderId,
                userId,
                orderStatus: {
                    name: ORDER_STATUS.DELIVERED,
                },
            },
        });
        if (!order) {
            throw new NotFoundException('Order not found or is not in a valid status to refund');
        }

        await this.prisma.order.update({
            where: {
                id: orderId,
                userId,
            },
            data: {
                orderStatus: {
                    connect: {
                        name: ORDER_STATUS.RETURNED_REFUND,
                    },
                },
            },
        });
    }

    async getOrders({
        limit,
        page,
        type,
        search,
        searchBy,
        from,
        to,
        skip,
        order,
        voucherId,
    }: OrderQueryDTO): Promise<Pagination<GetOrderAdminDTO>> {
        const keyword = search && search.trim().split(/\s+/).join(' & ');

        const [orders, totalCount] = await Promise.all([
            this.prisma.order.findMany({
                where: {
                    ...(type && { orderStatusId: type }),
                    ...(searchBy == 1 && {
                        items: { some: { item: { name: { search: keyword, mode: 'insensitive' } } } },
                    }),
                    ...(voucherId && { voucherId }),
                    ...(searchBy == 2 && { user: { username: { contains: search, mode: 'insensitive' } } }),
                    AND: [
                        { ...(from && { createdAt: { gte: dayjs(from).toISOString() } }) },
                        { ...(to && { createdAt: { lte: dayjs(to).toISOString() } }) },
                    ],
                },
                skip,
                take: limit,
                orderBy: {
                    ...(order ? { createdAt: order } : { createdAt: 'desc' }),
                },
                select: {
                    id: true,
                    user: {
                        select: {
                            id: true,
                            username: true,
                        },
                    },
                    orderStatus: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    items: {
                        select: {
                            quantity: true,
                            item: {
                                select: {
                                    id: true,
                                    name: true,
                                    thumbnail: true,
                                },
                            },
                        },
                    },
                    note: true,
                    totalPrice: true,
                    createdAt: true,
                },
            }),
            this.prisma.order.count({
                where: {
                    ...(type && { orderStatusId: type }),
                    ...(searchBy == 1 && {
                        items: { some: { item: { name: { search: keyword, mode: 'insensitive' } } } },
                    }),
                    ...(searchBy == 2 && { user: { username: { contains: search, mode: 'insensitive' } } }),
                    AND: [
                        { ...(from && to && { createdAt: { gte: dayjs(from).toISOString() } }) },
                        { ...(to && { createdAt: { lte: dayjs(to).toISOString() } }) },
                    ],
                },
            }),
        ]);

        async function formatResult(result: any) {
            return {
                ...result,
                items: result.items.map((e: any) => ({
                    ...e.item,
                    quantity: e.quantity,
                })),
            };
        }
        const items = await Promise.all(orders.map((order) => formatResult(order)));

        return createPagination<GetOrderAdminDTO>({
            items,
            totalCount,
            limit,
            currentPage: page,
        });
    }

    async updateOrderStatus({ orderId, statusId }: SetOrderStatusDTO): Promise<void> {
        const order = await this.findOrderById(orderId);
        if (!order) {
            throw new NotFoundException('Order not found');
        }

        await this.prisma.order.update({
            where: {
                id: orderId,
            },
            data: {
                orderStatusId: statusId,
            },
        });

        if (statusId === 6) {
            // Nếu hủy đơn hàng thì cần hoàn lại voucher đã dùng bởi user
            await this.prisma.voucherUsed.delete({
                where: {
                    voucherId_userId: {
                        voucherId: order.voucherId,
                        userId: order.userId,
                    },
                },
            });
        }
    }

    async findOrderById(orderId: string): Promise<Order | undefined> {
        return this.prisma.order.findUnique({
            where: {
                id: orderId,
            },
        });
    }

    async findOrderByItemId(itemId: number): Promise<OrderItem | undefined> {
        return this.prisma.orderItem.findFirst({
            where: {
                itemId,
            },
        });
    }

    async findOrderByStatusId(statusId: number): Promise<Order | undefined> {
        return this.prisma.order.findFirst({
            where: {
                orderStatusId: statusId,
            },
        });
    }
}
