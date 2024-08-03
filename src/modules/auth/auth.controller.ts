import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ChangePasswordDTO, ForgotPasswordDTO, RegisterDTO } from './dto';
import { Tokens } from './interfaces';
import { LoginDTO } from './dto/login.dto';
import { Request } from 'express';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResult } from '~/decorators';
import { UserService } from '../user/user.service';

@ApiTags('Auth - Xác thực')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly userService: UserService,
    ) {}

    @Post('register')
    @ApiOperation({ summary: 'Đăng ký tài khoản' })
    @ApiResult({ type: Tokens })
    @HttpCode(HttpStatus.OK)
    async register(@Body() bodyReq: RegisterDTO): Promise<Tokens> {
        return this.authService.register(bodyReq);
    }

    @Post('login')
    @ApiOperation({ summary: 'Đăng nhập' })
    @ApiResult({ type: Tokens })
    @HttpCode(HttpStatus.OK)
    async login(@Body() bodyReq: LoginDTO): Promise<Tokens> {
        return this.authService.login(bodyReq);
    }

    @UseGuards(RefreshTokenGuard)
    @Post('refresh-token')
    @ApiOperation({ summary: 'Làm mới token' })
    @ApiResult({ type: Tokens })
    @HttpCode(HttpStatus.OK)
    async refreshToken(@Req() req: Request): Promise<Tokens> {
        const user = req.user;
        return await this.authService.refreshToken(user['sub'], user['refreshToken']);
    }

    @Post('send-reset-email')
    @ApiOperation({ summary: 'Gửi email yêu cầu reset mật khẩu khi quên mật khẩu' })
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
    @HttpCode(HttpStatus.OK)
    async sendMail(@Body() body: ForgotPasswordDTO) {
        console.log(body);
        return await this.authService.sendEmail(body);
    }

    @Post('reset-password')
    @ApiOperation({ summary: 'Thiết lập lại mật khẩu khi quên mật khẩu' })
    @HttpCode(HttpStatus.OK)
    async forgotPassword(@Body() body: ChangePasswordDTO) {
        await this.userService.changePassword(body);
    }
}
