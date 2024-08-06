import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../guards';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserService } from '~/modules/user/user.service';
import { ApiResult, UserId } from '~/decorators';
import { CreateAddressDTO, DeleteAddressDTO, GetAddressDTO, SetDefaultAddressDTO, UpdateAddressDTO } from '../dto';

@ApiTags('Address - Địa chỉ (Nơi nhận hàng)')
@Controller('account/address')
@UseGuards(AccessTokenGuard)
export class AddressController {
    constructor(private readonly userService: UserService) {}

    @Get('get-user-address-list')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Người dùng xem danh sách thông tin địa chỉ của mình' })
    @ApiResult({ type: [GetAddressDTO] })
    async list(@UserId() userId: string): Promise<GetAddressDTO[]> {
        return await this.userService.getListAddress(userId);
    }

    @Post('create')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Người dùng thêm địa chỉ mới' })
    @HttpCode(HttpStatus.OK)
    async create(@Body() payload: CreateAddressDTO, @UserId() userId: string): Promise<void> {
        await this.userService.createAddress(payload, userId);
    }

    @Post('update')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Cập nhật thông tin địa chỉ' })
    @HttpCode(HttpStatus.OK)
    async update(@UserId() userId: string, @Body() payload: UpdateAddressDTO): Promise<void> {
        await this.userService.updateAddress(userId, payload);
    }

    @Post('delete')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Xóa thông tin địa chỉ' })
    @HttpCode(HttpStatus.OK)
    async delete(@UserId() userId: string, @Body() deleteBody: DeleteAddressDTO): Promise<void> {
        await this.userService.deleteAddress(userId, deleteBody);
    }

    @Post('set-default-address')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Thiết lập địa chỉ mặc định' })
    @HttpCode(HttpStatus.OK)
    async setDefault(@UserId() userId: string, @Body() setDefaultBody: SetDefaultAddressDTO): Promise<void> {
        await this.userService.setDefaultAddress(userId, setDefaultBody);
    }
}
