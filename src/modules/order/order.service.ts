import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '~/shared/prisma/prisma.service';
import { CreateOrderDTO } from './dto/order.dto';
import dayjs from 'dayjs';
import { OrderItem } from '@prisma/client';

@Injectable()
export class OrderService {
    constructor(private readonly prisma: PrismaService) {}

    async createOrder(body: CreateOrderDTO, userId: string) {
        const { voucher, items, address, note, paymentMethod } = body;

        const orderItems: Omit<OrderItem, 'orderId'>[] = [];
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
                product.flashSales.length > 0 &&
                product.flashSales[0].quantity &&
                product.flashSales[0].sold + item.quantity > product.flashSales[0].quantity
            ) {
                throw new BadRequestException(`Item ${product.name} is not in enough stock`);
            }
            console.log('Flash sale stock check passed');
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
                console.log('User order items:', userOrderItems);

                if (userOrderItems) {
                    // Đếm tổng số lượng sản phẩm đang xét thuộc flash sale mà user đã đặt mua
                    const userOrderItemCount = userOrderItems.reduce(
                        (acc, userOrderItem) => acc + userOrderItem.quantity,
                        0,
                    );
                    // Kiểm tra xem sản phẩm đang xét có số lượng quantity vượt quá giới hạn đặt hàng flash sale không?
                    if (userOrderItemCount + item.quantity > product.flashSales[0].orderLimit) {
                        throw new BadRequestException(`Item ${product.name} has reached its order limit`);
                    }
                }
            }
            console.log('Order limit check passed');

            const unitPrice = product.flashSales.length > 0 ? product.flashSales[0].discountedPrice : product.price;
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

        return this.prisma.$transaction(async (prisma) => {
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
                    voucher: {
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
                    },
                });

                // sửa tiếp, cập nhật voucherUsed , quantity

                console.log(voucherData);

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
                if (product.flashSales.length > 0) {
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

                if (updateItem.stock < 0) {
                    throw new BadRequestException(`Item ${updateItem.name} is out of stock`);
                }
            });

            await Promise.all(updateItems);
            return order;
        });
    }
}