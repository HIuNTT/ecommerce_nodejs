import { Body, Controller, Get, HttpCode, HttpStatus, Post, Put, UseGuards } from '@nestjs/common';
import { ApiResult, UserId } from '~/decorators';
import { AccessTokenGuard } from '../guards';
import { UserService } from '~/modules/user/user.service';
import { AccountInfo } from '~/modules/user/dto/user.dto';
import { AccountUpdateDTO } from '../dto';
import { UpdatePasswordDTO } from '~/modules/user/dto/password.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../auth.service';

@ApiTags('Account - Tài khoản')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller('account')
export class AccountController {
    constructor(
        private readonly userService: UserService,
        private readonly authService: AuthService,
    ) {}

    @Get('profile')
    @ApiOperation({ summary: 'Lấy ra thông tin hồ sơ' })
    @ApiResult({ type: AccountInfo })
    async profile(@UserId() userId: string): Promise<AccountInfo> {
        return this.userService.getAccountInfo(userId);
    }

    @Put('update-profile')
    @ApiOperation({ summary: 'Chỉnh sửa thông tin hồ sơ' })
    async update(@UserId() userId: string, @Body() info: AccountUpdateDTO): Promise<void> {
        await this.userService.updateAccountInfo(userId, info);
    }

    @Post('change-password')
    @ApiOperation({ summary: 'Thay đổi mật khẩu' })
    @HttpCode(HttpStatus.OK)
    async changePassword(@UserId() userId: string, @Body() body: UpdatePasswordDTO): Promise<void> {
        await this.userService.updatePassword(userId, body);
    }

    @Get('logout')
    @ApiOperation({ summary: 'Đăng xuất tài khoản' })
    async logout(@UserId() userId: string): Promise<void> {
        await this.authService.logout(userId);
    }
}
