import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AccessTokenGuard } from '../auth/guards';
import { UserId } from 'src/decorators';

@Controller('user')
@UseGuards(AccessTokenGuard)
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get('profile')
    getProfile(@UserId() userId: string) {
        return this.userService.getProfile(userId);
    }
}
