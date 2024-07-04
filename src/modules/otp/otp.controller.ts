import { Body, Controller, HttpCode, HttpStatus, Post, Render, UseGuards } from '@nestjs/common';
import { OtpService } from './otp.service';
import { AccessTokenGuard } from '../auth/guards';
import { UserId } from 'src/decorators';
import { BodyEmail, VerifyEmail } from './dto/verify-otp.dto';

@Controller('otp')
export class OtpController {
    constructor(private readonly otpService: OtpService) {}

    @Post('send-email-otp')
    @UseGuards(AccessTokenGuard)
    @HttpCode(HttpStatus.OK)
    async sendEmailOtp(@Body() body: BodyEmail, @UserId() userId: string) {
        return await this.otpService.sendEmailOtp(body, userId);
    }

    @Post('verify-email-otp')
    @UseGuards(AccessTokenGuard)
    @HttpCode(HttpStatus.OK)
    async verifyEmailOtp(@Body() body: VerifyEmail, @UserId() userId: string) {
        return this.otpService.verifyOtp(body, userId);
    }

    sendPhoneOtp() {}
}
