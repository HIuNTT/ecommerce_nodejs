import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { VoucherService } from './voucher.service';
import { CreateVoucherDTO, UpdateVoucherDTO } from './dto';
import { IdParam, UserId } from '~/decorators';
import { AccessTokenGuard } from '../auth/guards';

@Controller('voucher')
export class VoucherController {
    constructor(private readonly voucherService: VoucherService) {}

    @Get('get-recommend-platform-vouchers')
    @UseGuards(AccessTokenGuard)
    async getList(@UserId() userId: string) {
        return await this.voucherService.getListRecommendVouchers(userId);
    }

    @Post('create')
    @HttpCode(HttpStatus.OK)
    async create(@Body() body: CreateVoucherDTO): Promise<void> {
        return await this.voucherService.createVoucher(body);
    }

    @Put('update')
    async update(@Body() body: UpdateVoucherDTO): Promise<void> {
        await this.voucherService.updateVoucher(body);
    }

    @Delete('delete/:id')
    async delete(@IdParam() voucherId: number): Promise<void> {
        await this.voucherService.deleteVoucher(voucherId);
    }

    @Patch('end/:id')
    async end(@IdParam() voucherId: number): Promise<void> {
        await this.voucherService.endNowVoucher(voucherId);
    }
}
