import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AccessTokenGuard } from '../auth/guards';
import { UserId } from '../../decorators';
import { BodyEmail } from '../otp/dto/verify-otp.dto';

@Controller('user')
@UseGuards(AccessTokenGuard)
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get('profile')
    @UseGuards(AccessTokenGuard)
    async getProfile(@UserId() userId: string) {
        return this.userService.getProfile(userId);
    }

    @Post('check-email-available')
    @UseGuards(AccessTokenGuard)
    @HttpCode(HttpStatus.OK)
    async checkEmailAvailable(@Body() body: BodyEmail) {
        return this.userService.checkEmailAvailable(body);
    }
}
