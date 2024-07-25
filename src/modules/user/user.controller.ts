import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AccessTokenGuard } from '../auth/guards';
import { UserId } from '../../decorators';
import { BodyEmail } from '../otp/dto/verify-otp.dto';

@Controller('user')
@UseGuards(AccessTokenGuard)
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post('check-email-available')
    @UseGuards(AccessTokenGuard)
    @HttpCode(HttpStatus.OK)
    async checkEmailAvailable(@Body() body: BodyEmail) {
        return this.userService.checkEmailAvailable(body);
    }
}
