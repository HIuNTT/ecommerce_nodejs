import { Body, Controller, HttpCode, HttpStatus, Post, Render, UseGuards } from '@nestjs/common';
import { OtpService } from './otp.service';
import { AccessTokenGuard } from '../auth/guards';
import { Bypass, UserId } from 'src/decorators';
import { BodyEmail, VerifyEmail } from './dto/verify-otp.dto';

@Controller('otp')
export class OtpController {
    constructor(private readonly otpService: OtpService) {}

    @Post('send-email-otp')
    @HttpCode(HttpStatus.OK)
    @Bypass()
    async sendEmailOtp(@Body() body: BodyEmail) {
        return await this.otpService.sendEmailOtp(body);
    }

    @Post('verify-email-otp')
    @UseGuards(AccessTokenGuard)
    @HttpCode(HttpStatus.OK)
    async verifyEmailOtp(@Body() body: VerifyEmail, @UserId() userId: string): Promise<void> {
        await this.otpService.verifyOtp(body, userId);
    }

    sendPhoneOtp() {}
}
