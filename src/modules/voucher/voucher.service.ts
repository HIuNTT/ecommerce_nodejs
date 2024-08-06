import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '~/shared/prisma/prisma.service';
import {
    CreateVoucherDTO,
    GetVoucherAdminDTO,
    GetVoucherDetailDTO,
    GetVoucherUserDTO,
    UpdateVoucherDTO,
    VoucherQueryDTO,
} from './dto';
import dayjs from 'dayjs';
import { createPagination } from '~/helpers/paginate/create-pagination';
import { Pagination } from '~/helpers/paginate/pagination';

@Injectable()
export class VoucherService {
    constructor(private readonly prisma: PrismaService) {}

    async getListVouchers(query: VoucherQueryDTO): Promise<Pagination<GetVoucherAdminDTO>> {
        const { page, limit, search, skip } = query;

        const keyword = search && search.trim().split(/\s+/).join(' & ');

        const [vouchers, totalCount] = await Promise.all([
            this.prisma.voucher.findMany({
                where: {
                    ...(search && {
                        OR: [
                            { voucherCode: { search: keyword, mode: 'insensitive' } },
                            { name: { search: keyword, mode: 'insensitive' } },
                        ],
                    }),
                },
                take: limit,
                skip,
                orderBy: {
                    startTime: 'desc',
                },
            }),
            this.prisma.voucher.count({
                where: {
                    ...(search && {
                        OR: [
                            { voucherCode: { search: keyword, mode: 'insensitive' } },
                            { name: { search: keyword, mode: 'insensitive' } },
                        ],
                    }),
                },
            }),
        ]);

        return createPagination<GetVoucherAdminDTO>({
            currentPage: page,
            items: vouchers,
            limit,
            totalCount,
        });
    }

    async getListRecommendVouchers(userId: string): Promise<GetVoucherUserDTO[]> {
        const now = dayjs().toDate();

        const vouchers = await this.prisma.$queryRaw<GetVoucherUserDTO[]>`
            SELECT v.*, (v."usageLimitPerUser" - COALESCE(vu.quantity, 0)) AS "remainingUsageLimit" 
            FROM "public"."vouchers" AS v 
            LEFT JOIN "public"."vouchers_used" AS vu 
            ON vu."voucherId" = v."id" AND vu."userId" = ${userId}
            WHERE v."startTime" <= ${now}
            AND v."endTime" >= ${now}
            AND v."maxCount" > v."usedCount" 
            AND v."usageLimitPerUser" > COALESCE(vu.quantity, 0)`;

        return vouchers;
    }

    async getVoucherDetail(voucherId: number): Promise<GetVoucherDetailDTO> {
        const voucher = await this.prisma.voucher.findUnique({
            where: {
                id: voucherId,
            },
            omit: {
                usedCount: true,
            },
        });

        if (!voucher) {
            throw new BadRequestException('Voucher not found');
        }

        return voucher;
    }

    async createVoucher(body: CreateVoucherDTO): Promise<void> {
        const voucher = await this.prisma.voucher.findFirst({
            where: {
                voucherCode: body.voucherCode,
                endTime: {
                    gte: dayjs().toDate(),
                },
            },
        });

        if (voucher) {
            throw new BadRequestException('Voucher code already exists. Please change the voucher code!');
        }

        await this.prisma.voucher.create({
            data: {
                ...body,
                startTime: dayjs(body.startTime).toISOString(),
                endTime: dayjs(body.endTime).toISOString(),
            },
        });
    }

    // Chỉ voucher sắp diễn ra hoặc đang diễn ra mới được chỉnh sửa
    async updateVoucher(body: UpdateVoucherDTO): Promise<void> {
        const { id, ...otherData } = body;
        const voucher = await this.prisma.voucher.findUnique({
            where: {
                id,
            },
        });

        if (!voucher) {
            throw new BadRequestException('Voucher not found');
        }

        const { startTime, endTime } = voucher;

        if (dayjs().isAfter(endTime)) {
            throw new BadRequestException('Cannot update a voucher in an ended');
        }

        // Voucher sắp diễn ra: được sửa toàn bộ, ngoài trừ mã voucher
        if (dayjs().isBefore(startTime)) {
            await this.prisma.voucher.update({
                where: {
                    id,
                },
                data: {
                    ...otherData,
                },
            });
        }

        // Voucher đang diễn ra: chỉ được sửa tên voucher, thời gian kết thúc và lượt sử dụng tối đa / người mua và số lượng voucher
        await this.prisma.voucher.update({
            where: {
                id,
            },
            data: {
                name: body.name,
                endTime: body.endTime,
                usageLimitPerUser: body.usageLimitPerUser,
                maxCount: body.maxCount,
            },
        });
    }

    // Chỉ xóa các voucher chưa diễn ra (sắp diễn ra)
    async deleteVoucher(voucherId: number): Promise<void> {
        const voucher = await this.prisma.voucher.findUnique({
            where: {
                id: voucherId,
            },
        });

        if (!voucher) {
            throw new BadRequestException('Voucher not found');
        }

        const { startTime } = voucher;

        if (dayjs().isBefore(startTime)) {
            await this.prisma.voucher.delete({
                where: {
                    id: voucherId,
                },
            });
        } else {
            throw new BadRequestException('Cannot delete a voucher in an ongoing or ended');
        }
    }

    // Kết thúc voucher ngay lập tức
    async endNowVoucher(voucherId: number) {
        const voucher = await this.prisma.voucher.findUnique({
            where: {
                id: voucherId,
            },
        });

        if (!voucher) {
            throw new BadRequestException('Voucher not found');
        }

        await this.prisma.voucher.update({
            where: {
                id: voucherId,
            },
            data: {
                endTime: dayjs().toDate(),
            },
        });
    }
}
