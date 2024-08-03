import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { VoucherService } from './voucher.service';
import { CreateVoucherDTO, UpdateVoucherDTO } from './dto';
import { IdParam, Roles, UserId } from '~/decorators';
import { AccessTokenGuard } from '../auth/guards';
import { ROLE } from '~/enums/role.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Voucher - Voucher giảm giá')
@Controller('voucher')
export class VoucherController {
    constructor(private readonly voucherService: VoucherService) {}

    @Get('get-recommend-platform-vouchers')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Lấy ra danh sách voucher có sẵn đối với người dùng' })
    @UseGuards(AccessTokenGuard)
    async getList(@UserId() userId: string) {
        return await this.voucherService.getListRecommendVouchers(userId);
    }

    @Post('create')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Thêm voucher mới' })
    @HttpCode(HttpStatus.OK)
    @Roles(ROLE.ADMIN, ROLE.MANAGER)
    @UseGuards(AccessTokenGuard, RolesGuard)
    async create(@Body() body: CreateVoucherDTO): Promise<void> {
        return await this.voucherService.createVoucher(body);
    }

    @Put('update')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Chỉnh sửa voucher' })
    @Roles(ROLE.ADMIN, ROLE.MANAGER)
    @UseGuards(AccessTokenGuard, RolesGuard)
    async update(@Body() body: UpdateVoucherDTO): Promise<void> {
        await this.voucherService.updateVoucher(body);
    }

    @Delete('delete/:id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Xóa voucher' })
    @Roles(ROLE.ADMIN, ROLE.MANAGER)
    @UseGuards(AccessTokenGuard, RolesGuard)
    async delete(@IdParam() voucherId: number): Promise<void> {
        await this.voucherService.deleteVoucher(voucherId);
    }

    @Patch('end/:id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Kết thúc voucher ngay lập tức' })
    @Roles(ROLE.ADMIN, ROLE.MANAGER)
    @UseGuards(AccessTokenGuard, RolesGuard)
    async end(@IdParam() voucherId: number): Promise<void> {
        await this.voucherService.endNowVoucher(voucherId);
    }
}
