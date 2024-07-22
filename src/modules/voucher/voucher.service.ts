import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '~/shared/prisma/prisma.service';
import { CreateVoucherDTO, UpdateVoucherDTO } from './dto';
import { EVoucherStatus } from '@prisma/client';
import dayjs from 'dayjs';

@Injectable()
export class VoucherService {
    constructor(private readonly prisma: PrismaService) {}

    async getListRecommendVouchers(userId: string) {
        const now = dayjs().toDate();
        console.log(now);

        const vouchers = await this.prisma.$queryRaw`
            SELECT v.*, (v."usageLimitPerUser" - COALESCE(vu.quantity, 0)) AS "remainingUsageLimit" 
            FROM "public"."vouchers" AS v 
            LEFT JOIN "public"."vouchers_used" AS vu 
            ON vu."voucherId" = v."id" AND vu."userId" = ${userId}
            WHERE v."status" = 'ONGOING' 
            AND v."startTime" <= ${now} 
            AND v."endTime" >= ${now} 
            AND v."maxCount" > v."usedCount" 
            AND v."usageLimitPerUser" > COALESCE(vu.quantity, 0)`;

        return vouchers;
    }

    async createVoucher(body: CreateVoucherDTO) {
        await this.prisma.voucher.create({
            data: {
                ...body,
            },
        });
    }

    // Chỉ voucher sắp diễn ra hoặc đang diễn ra mới được chỉnh sửa
    async updateVoucher(body: UpdateVoucherDTO) {
        const { voucherCode, ...otherData } = body;
        const { status } = await this.prisma.voucher.findUnique({
            where: {
                id: body.id,
            },
        });

        if (status === EVoucherStatus.ENDED) {
            throw new BadRequestException('Cannot update a voucher in an ongoing or ended');
        }

        // Voucher đang diễn ra: chỉ được sửa tên voucher, thời gian kết thúc và lượt sử dụng tối đa / người mua
        if (status === EVoucherStatus.ONGOING) {
            await this.prisma.voucher.update({
                where: {
                    id: body.id,
                },
                data: {
                    name: body.name,
                    endTime: body.endTime,
                    usageLimitPerUser: body.usageLimitPerUser,
                },
            });
        }

        // Voucher sắp diễn ra: được sửa toàn bộ, ngoài trừ mã voucher
        await this.prisma.voucher.update({
            where: {
                id: body.id,
            },
            data: {
                ...otherData,
            },
        });
    }

    // Chỉ xóa các voucher chưa diễn ra
    async deleteVoucher(voucherId: number) {
        const { status } = await this.prisma.voucher.findUnique({
            where: {
                id: voucherId,
            },
        });

        if (status === EVoucherStatus.ONGOING || status === EVoucherStatus.ENDED) {
            throw new BadRequestException('Cannot delete a voucher in an ongoing or ended');
        }

        await this.prisma.voucher.delete({
            where: {
                id: voucherId,
            },
        });
    }

    // Kết thúc voucher ngay lập tức
    async endNowVoucher(voucherId: number) {
        await this.prisma.voucher.update({
            where: {
                id: voucherId,
            },
            data: {
                status: EVoucherStatus.ENDED,
                endTime: new Date(),
            },
        });
    }
}
