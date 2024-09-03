import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ChangePasswordDTO, ForgotPasswordDTO, RegisterDTO } from './dto';
import { LoginDTO } from './dto/login.dto';
import { Request, Response } from 'express';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResult } from '~/decorators';
import { UserService } from '../user/user.service';
import { Token } from './interfaces';

@ApiTags('Auth - Xác thực')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly userService: UserService,
    ) {}

    @Post('register')
    @ApiOperation({ summary: 'Đăng ký tài khoản' })
    @ApiResult({ type: Token })
    @HttpCode(HttpStatus.OK)
    async register(@Body() bodyReq: RegisterDTO, @Res({ passthrough: true }) res: Response): Promise<Token> {
        return this.authService.register(bodyReq, res);
    }

    @Post('login')
    @ApiOperation({ summary: 'Đăng nhập' })
    @ApiResult({ type: Token })
    @HttpCode(HttpStatus.OK)
    async login(@Body() bodyReq: LoginDTO, @Res({ passthrough: true }) res: Response): Promise<Token> {
        return this.authService.login(bodyReq, res);
    }

    @UseGuards(RefreshTokenGuard)
    @Post('refresh-token')
    @ApiOperation({ summary: 'Làm mới token' })
    @ApiResult({ type: Token })
    @HttpCode(HttpStatus.OK)
    async refreshToken(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<Token> {
        const user = req.user;
        return await this.authService.refreshToken(user['sub'], user['refreshToken'], res);
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
