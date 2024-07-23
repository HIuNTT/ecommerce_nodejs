import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Put, Query, UseGuards } from '@nestjs/common';
import { FlashSaleService } from './flash-sale.service';
import { CreateFlashSaleDTO, UpdateFlashSaleDTO } from './dto/flash-sale.dto';
import { IdParam, Roles } from '~/decorators';
import { Filters } from '~/interfaces';
import { FlashSale } from '@prisma/client';
import { AccessTokenGuard } from '../auth/guards';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ROLE } from '~/enums/role.enum';

@Controller('flash-sale')
export class FlashSaleController {
    constructor(private readonly flashSaleService: FlashSaleService) {}

    @Get('get-list-flash-sales')
    async getFlashSales(
        @Query() filters: Filters,
    ): Promise<Omit<FlashSale, 'isActived' | 'createdAt' | 'updatedAt' | 'status'>[]> {
        return await this.flashSaleService.getFlashSales(filters);
    }

    @Get('flash-sale-get-items')
    async getItemsFlashSale(@Query() filters: Filters) {
        return await this.flashSaleService.getItemsByFlashSaleId(filters);
    }

    @Post('create')
    @HttpCode(HttpStatus.OK)
    @Roles(ROLE.ADMIN, ROLE.MANAGER)
    @UseGuards(AccessTokenGuard, RolesGuard)
    async create(@Body() body: CreateFlashSaleDTO): Promise<void> {
        await this.flashSaleService.createFlashSale(body);
    }

    @Put('update')
    @Roles(ROLE.ADMIN, ROLE.MANAGER)
    @UseGuards(AccessTokenGuard, RolesGuard)
    async update(@Body() body: UpdateFlashSaleDTO): Promise<void> {
        await this.flashSaleService.updateFlashSale(body);
    }

    @Delete('delete/:id')
    @HttpCode(HttpStatus.OK)
    @Roles(ROLE.ADMIN, ROLE.MANAGER)
    @UseGuards(AccessTokenGuard, RolesGuard)
    async delete(@IdParam() flashSaleId: number) {
        await this.flashSaleService.deleteFlashSale(flashSaleId);
    }
}
