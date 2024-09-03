import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ItemService } from './item.service';
import { CreateItemDTO, GetItemDetailDTO, GetItemDTO, ItemQueryDTO } from './dto/item.dto';
import { ApiResult, IdParam, Roles } from '~/decorators';
import { UpdateItemDTO } from './dto/update-item.dto';
import { AccessTokenGuard } from '../auth/guards';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ROLE } from '~/enums/role.enum';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Pagination } from '~/helpers/paginate/pagination';

@ApiTags('Item - Sản phẩm')
@Controller('item')
export class ItemController {
    constructor(private readonly itemService: ItemService) {}

    @Get()
    @ApiOperation({
        summary: 'Lấy ra danh sách sản phẩm',
        description: `
* Nếu dành cho trang user thì trường user = true
        
* Nếu dành cho trang admin thì không cần truyền trường user (user = false)`,
    })
    @ApiResult({ type: [GetItemDTO], isPage: true })
    async getList(@Query() filters: ItemQueryDTO): Promise<Pagination<GetItemDTO>> {
        return await this.itemService.getListItem(filters);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Chi tiết sản phẩm' })
    @ApiResult({ type: GetItemDetailDTO })
    async detail(@IdParam() itemId: number, @Query() user: boolean): Promise<GetItemDetailDTO> {
        return await this.itemService.getItemById(itemId, user);
    }

    @Post('create')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Thêm sản phẩm mới', description: '* Chỉ admin mới có quyền thêm' })
    @HttpCode(HttpStatus.OK)
    @Roles(ROLE.ADMIN, ROLE.MANAGER)
    @UseGuards(AccessTokenGuard, RolesGuard)
    async create(@Body() body: CreateItemDTO): Promise<void> {
        await this.itemService.createItem(body);
    }

    @Put('update')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Chỉnh sửa sản phẩm', description: '* Chỉ admin mới có quyền chỉnh sửa' })
    @Roles(ROLE.ADMIN, ROLE.MANAGER)
    @UseGuards(AccessTokenGuard, RolesGuard)
    async update(@Body() body: UpdateItemDTO): Promise<void> {
        await this.itemService.updateItem(body);
    }

    @Delete('delete/:id')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Xóa sản phẩm',
        description: `
* Chỉ admin mới có quyền xóa
        
* Chỉ xóa được các sản phẩm chưa có đơn hàng nào`,
    })
    @HttpCode(HttpStatus.OK)
    @Roles(ROLE.ADMIN, ROLE.MANAGER)
    @UseGuards(AccessTokenGuard, RolesGuard)
    async delete(@IdParam() itemId: number): Promise<void> {
        await this.itemService.deleteItem(itemId);
    }
}
