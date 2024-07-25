import { Body, Controller, Get, HttpCode, HttpStatus, Post, Put, UseGuards } from '@nestjs/common';
import { Public, UserId } from '~/decorators';
import { AccessTokenGuard } from '../guards';
import { UserService } from '~/modules/user/user.service';
import { AccountInfo } from '~/modules/user/dto/user.dto';
import { AccountUpdateDTO, ChangePasswordDTO } from '../dto';
import { UpdatePasswordDTO } from '~/modules/user/dto/password.dto';

@Controller('account')
@UseGuards(AccessTokenGuard)
export class AccountController {
    constructor(private readonly userService: UserService) {}

    @Get('profile')
    async profile(@UserId() userId: string): Promise<AccountInfo> {
        return this.userService.getAccountInfo(userId);
    }

    @Put('update-profile')
    async update(@UserId() userId: string, @Body() info: AccountUpdateDTO): Promise<void> {
        await this.userService.updateAccountInfo(userId, info);
    }

    @Post('change-password')
    @HttpCode(HttpStatus.OK)
    async changePassword(@UserId() userId: string, @Body() body: UpdatePasswordDTO): Promise<void> {
        await this.userService.updatePassword(userId, body);
    }

    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    @Public()
    async forgotPassword(@Body() body: ChangePasswordDTO) {
        await this.userService.changePassword(body);
    }
}
