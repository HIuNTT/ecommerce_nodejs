import { Body, Controller, HttpCode, HttpStatus, Post, Render, UseGuards } from '@nestjs/common';
import { OtpService } from './otp.service';
import { AccessTokenGuard } from '../auth/guards';
import { Bypass, UserId } from 'src/decorators';
import { BodyEmail, VerifyEmail } from './dto/verify-otp.dto';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

@ApiTags('OTP - Xác thực bằng OTP')
@Controller('otp')
export class OtpController {
    constructor(private readonly otpService: OtpService) {}

    @Post('send-email-otp')
    @ApiOperation({
        summary: 'Gửi mã OTP qua email để verify email',
        description: `
* Dành cho trường hợp sau khi đăng ký tài khoản, mới xác thực email 

* Sau 60 giây mới cho phép yêu cầu gửi lại mã OTP`,
    })
    @ApiOkResponse({
        description: 'Send email successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string' },
                statusCode: { type: 'integer', default: 200 },
            },
        },
    })
    @Throttle({ default: { limit: 1, ttl: 60000 } })
    @HttpCode(HttpStatus.OK)
    @Bypass()
    async sendEmailOtp(@Body() body: BodyEmail) {
        return await this.otpService.sendEmailOtp(body);
    }

    @Post('verify-email-otp')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Xác thực mã OTP có khớp với OTP được gửi đến email hay không?',
        description: '* Dành cho trường hợp sau khi đăng ký tài khoản, mới xác thực email',
    })
    @UseGuards(AccessTokenGuard)
    @HttpCode(HttpStatus.OK)
    async verifyEmailOtp(@Body() body: VerifyEmail, @UserId() userId: string): Promise<void> {
        await this.otpService.verifyOtp(body, userId);
    }

    sendPhoneOtp() {}
}
