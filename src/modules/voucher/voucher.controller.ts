import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { VoucherService } from './voucher.service';
import {
    CreateVoucherDTO,
    GetVoucherAdminDTO,
    GetVoucherDetailDTO,
    GetVoucherUserDTO,
    UpdateVoucherDTO,
    VoucherQueryDTO,
} from './dto';
import { ApiResult, IdParam, Roles, UserId } from '~/decorators';
import { AccessTokenGuard } from '../auth/guards';
import { ROLE } from '~/enums/role.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Pagination } from '~/helpers/paginate/pagination';

@ApiTags('Voucher - Voucher giảm giá')
@Controller('voucher')
@UseGuards(AccessTokenGuard)
export class VoucherController {
    constructor(private readonly voucherService: VoucherService) {}

    @Get()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Danh sách voucher (Trang admin)' })
    @ApiResult({ type: [GetVoucherAdminDTO], isPage: true })
    @Roles(ROLE.ADMIN, ROLE.MANAGER)
    @UseGuards(RolesGuard)
    async list(@Query() query: VoucherQueryDTO): Promise<Pagination<GetVoucherAdminDTO>> {
        return await this.voucherService.getListVouchers(query);
    }

    @Get('get-recommend-platform-vouchers')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Lấy ra danh sách voucher có sẵn đối với người dùng' })
    @ApiResult({ type: [GetVoucherUserDTO] })
    async getList(@UserId() userId: string): Promise<GetVoucherUserDTO[]> {
        return await this.voucherService.getListRecommendVouchers(userId);
    }

    @Get(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Chi tiết voucher (Để admin chỉnh sửa)', description: 'Chỉ admin mới có quyền' })
    @ApiResult({ type: GetVoucherDetailDTO })
    @Roles(ROLE.ADMIN, ROLE.MANAGER)
    @UseGuards(RolesGuard)
    async detail(@IdParam() voucherId: number): Promise<GetVoucherDetailDTO> {
        return await this.voucherService.getVoucherDetail(voucherId);
    }

    @Post('create')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Thêm voucher mới',
        description: `
Chỉ admin mới có quyền thêm voucher mới
* Voucher code không được trùng với voucher code của những voucher đang diễn ra hoặc sắp diễn ra`,
    })
    @HttpCode(HttpStatus.OK)
    @Roles(ROLE.ADMIN, ROLE.MANAGER)
    @UseGuards(RolesGuard)
    async create(@Body() body: CreateVoucherDTO): Promise<void> {
        await this.voucherService.createVoucher(body);
    }

    @Post('update')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Chỉnh sửa voucher',
        description: `
Chỉ được chỉnh sửa voucher đang diễn ra hoặc sắp diễn ra:

* Đối với voucher đang diễn ra: chỉ được chỉnh sửa tên chương trình voucher, thời gian kết thúc, lượt sử dụng tối đa/người mua, số lượng voucher. Không được sửa mã chương trình giảm giá (voucher)

* Đối với voucher sắp diễn ra: được chỉnh sửa toàn bộ thông tin ngoài trừ mã chương trình giảm giá (voucher)`,
    })
    @Roles(ROLE.ADMIN, ROLE.MANAGER)
    @UseGuards(RolesGuard)
    @HttpCode(HttpStatus.OK)
    async update(@Body() body: UpdateVoucherDTO): Promise<void> {
        await this.voucherService.updateVoucher(body);
    }

    @Delete('delete/:id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Xóa voucher', description: 'Chỉ được phép xóa voucher chưa diễn ra (sắp diễn ra)' })
    @Roles(ROLE.ADMIN, ROLE.MANAGER)
    @UseGuards(RolesGuard)
    async delete(@IdParam() voucherId): Promise<void> {
        await this.voucherService.deleteVoucher(voucherId);
    }

    @Patch('end/:id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Kết thúc voucher ngay lập tức' })
    @Roles(ROLE.ADMIN, ROLE.MANAGER)
    @UseGuards(RolesGuard)
    async end(@IdParam() voucherId: number): Promise<void> {
        await this.voucherService.endNowVoucher(voucherId);
    }
}
