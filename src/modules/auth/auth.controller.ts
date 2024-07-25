import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ForgotPasswordDTO, RegisterDTO } from './dto';
import { Tokens } from './interfaces';
import { LoginDTO } from './dto/login.dto';
import { Request } from 'express';
import { AccessTokenGuard } from './guards/access-token.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() bodyReq: RegisterDTO): Promise<Tokens> {
        return this.authService.register(bodyReq);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() bodyReq: LoginDTO): Promise<Tokens> {
        return this.authService.login(bodyReq);
    }

    @UseGuards(AccessTokenGuard)
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(@Req() req: Request) {
        return this.authService.logout(req.user['sub']);
    }

    @UseGuards(RefreshTokenGuard)
    @Post('refresh-token')
    @HttpCode(HttpStatus.OK)
    async refreshToken(@Req() req: Request) {
        const user = req.user;
        return this.authService.refreshToken(user['sub'], user['refreshToken']);
    }

    @Post('send-reset-email')
    @HttpCode(HttpStatus.OK)
    async sendMail(@Body() body: ForgotPasswordDTO) {
        console.log(body);
        return await this.authService.sendEmail(body);
    }
}
