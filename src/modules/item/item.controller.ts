import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ItemService } from './item.service';
import { CreateItemDTO } from './dto/item.dto';
import { Item } from '@prisma/client';
import { IdParam, Roles } from '~/decorators';
import { UpdateItemDTO } from './dto/update-item.dto';
import { Filters } from '~/interfaces';
import { AccessTokenGuard } from '../auth/guards';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ROLE } from '~/enums/role.enum';

@Controller('item')
export class ItemController {
    constructor(private readonly itemService: ItemService) {}

    @Get()
    async getList(@Query() filters: Filters) {
        return await this.itemService.getListItem(filters);
    }

    // @Get(':slug')
    // async getBySlug(@Param('slug') slug: string): Promise<Omit<Item, 'isBestseller' | 'createdAt' | 'isActived'>> {
    //     return await this.itemService.getItemBySlug(slug);
    // }

    @Get(':id')
    async getById(@IdParam() itemId: number): Promise<Omit<Item, 'isBestseller' | 'createdAt' | 'isActived'>> {
        return await this.itemService.getItemById(itemId);
    }

    @Post('create')
    @HttpCode(HttpStatus.OK)
    @Roles(ROLE.ADMIN, ROLE.MANAGER)
    @UseGuards(AccessTokenGuard, RolesGuard)
    async create(@Body() body: CreateItemDTO): Promise<Omit<Item, 'isBestseller' | 'updatedAt'>> {
        return await this.itemService.createItem(body);
    }

    @Put('update')
    @Roles(ROLE.ADMIN, ROLE.MANAGER)
    @UseGuards(AccessTokenGuard, RolesGuard)
    async update(@Body() body: UpdateItemDTO): Promise<Omit<Item, 'isBestseller' | 'createdAt'>> {
        return await this.itemService.updateItem(body);
    }

    @Delete('delete/:id')
    @HttpCode(HttpStatus.OK)
    @Roles(ROLE.ADMIN, ROLE.MANAGER)
    @UseGuards(AccessTokenGuard, RolesGuard)
    async delete(@IdParam() itemId: number): Promise<void> {
        await this.itemService.deleteItem(itemId);
    }
}
