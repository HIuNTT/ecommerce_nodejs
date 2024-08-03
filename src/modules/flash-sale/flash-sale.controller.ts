import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Put, Query, UseGuards } from '@nestjs/common';
import { FlashSaleService } from './flash-sale.service';
import {
    CreateFlashSaleDTO,
    FlashSaleQueryDTO,
    GetFlashSaleDetailDTO,
    GetFlashSaleDTO,
    UpdateFlashSaleDTO,
} from './dto/flash-sale.dto';
import { ApiResult, IdParam, Roles } from '~/decorators';
import { AccessTokenGuard } from '../auth/guards';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ROLE } from '~/enums/role.enum';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Pagination } from '~/helpers/paginate/pagination';
import { GetFlashSaleDetailItemDTO, GetItemFlashSaleDTO, ItemFlashSaleQueryDTO } from './dto/flash-sale-item.dto';

@ApiTags('Flash Sale - Chương trình khuyến mãi đặc biệt')
@Controller('flash-sale')
export class FlashSaleController {
    constructor(private readonly flashSaleService: FlashSaleService) {}

    @Get()
    @ApiOperation({
        summary: 'Tổng quan danh sách chương trình flash sale',
        description: `
* Lọc theo trạng thái: upcoming, ongoing, ended, all (không truyền trường status)

* Nếu không truyền vào trường sortBy, sẽ sắp xếp theo thời gian bắt đầu giảm dần`,
    })
    @ApiResult({ type: [GetFlashSaleDTO], isPage: true })
    async list(@Query() filters: FlashSaleQueryDTO): Promise<Pagination<GetFlashSaleDTO>> {
        return await this.flashSaleService.getFlashSales(filters);
    }

    @Get('flash-sale-get-items/:id')
    @ApiOperation({
        summary: 'Danh sách sản phẩm thuộc flash sale cụ thể (Dành cho trang user)',
        description: '* Chỉ áp dụng với flash sale đang diễn ra hoặc sắp diễn ra',
    })
    @ApiResult({ type: [GetItemFlashSaleDTO], isPage: true })
    async getItemsFlashSale(
        @Query() filters: ItemFlashSaleQueryDTO,
        @IdParam() flashSaleId: number,
    ): Promise<Pagination<GetItemFlashSaleDTO>> {
        return await this.flashSaleService.getItemsByFlashSaleId(filters, flashSaleId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Chi tiết chương trình flash sale' })
    @ApiResult({ type: GetFlashSaleDetailDTO })
    async detail(@IdParam() flashSaleId: number): Promise<GetFlashSaleDetailDTO> {
        return await this.flashSaleService.getFlashSaleDetail(flashSaleId);
    }

    @Post('create')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Thêm chương trình flash sale (Chỉ admin có quyền thêm)' })
    @HttpCode(HttpStatus.OK)
    @Roles(ROLE.ADMIN, ROLE.MANAGER)
    @UseGuards(AccessTokenGuard, RolesGuard)
    async create(@Body() body: CreateFlashSaleDTO): Promise<void> {
        await this.flashSaleService.createFlashSale(body);
    }

    @Put('update')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Chỉnh sửa flash sale',
        description: '* Chỉ những flash sale sắp diễn ra mới được phép chỉnh sửa',
    })
    @Roles(ROLE.ADMIN, ROLE.MANAGER)
    @UseGuards(AccessTokenGuard, RolesGuard)
    async update(@Body() body: UpdateFlashSaleDTO): Promise<void> {
        await this.flashSaleService.updateFlashSale(body);
    }

    @Delete('delete/:id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Xóa flash sale', description: '* Chỉ những flash sale sắp diễn ra mới được phép xóa' })
    @HttpCode(HttpStatus.OK)
    @Roles(ROLE.ADMIN, ROLE.MANAGER)
    @UseGuards(AccessTokenGuard, RolesGuard)
    async delete(@IdParam() flashSaleId: number): Promise<void> {
        await this.flashSaleService.deleteFlashSale(flashSaleId);
    }
}
