import { BadRequestException, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '~/shared/prisma/prisma.service';
import { ForgotPasswordDTO, RegisterDTO } from './dto';
import { compare, hash } from '../../helpers/encryption.helper';
import { IPayloadToken, Tokens } from './interfaces';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginDTO } from './dto/login.dto';
import { UserService } from '../user/user.service';
import crypto from 'crypto';
import { MailService } from '~/shared/mail/mail.service';
import { join } from 'path';
import fs from 'fs';
import { ISecurityConfig, SecurityConfig } from '~/configs/security.config';
import passport from 'passport';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private config: ConfigService,
        private readonly userService: UserService,
        private readonly mailService: MailService,
        @Inject(SecurityConfig.KEY) private securityConfig: ISecurityConfig,
    ) {}

    async register(bodyReq: RegisterDTO): Promise<Tokens> {
        try {
            const { password, ...data } = bodyReq;

            const existedUser = await this.prisma.user.findFirst({
                where: {
                    OR: [
                        {
                            username: data.username,
                        },
                        {
                            email: data.email,
                        },
                        {
                            phone: data.phone,
                        },
                    ],
                },
            });

            if (existedUser) {
                throw new BadRequestException('User already exists');
            }

            const newUser = await this.prisma.user.create({
                data: {
                    ...data,
                    password: await hash(password),
                },
            });

            const tokens = await this.generateTokens({ userId: newUser.id });
            await this.updateRefreshToken(newUser.id, tokens.refresh_token);
            return tokens;
        } catch (error) {
            throw error;
        }
    }

    async login(bodyReq: LoginDTO): Promise<Tokens> {
        const { username, reqPassword } = bodyReq;
        const data = await this.prisma.user.findFirst({
            where: {
                OR: [
                    {
                        username,
                    },
                    {
                        email: username,
                    },
                    {
                        phone: username,
                    },
                ],
            },
        });

        if (!data) {
            throw new ForbiddenException('Access Denied');
        }

        const { password, ...user } = data;
        console.log(password, reqPassword, username);

        if (!(await compare(reqPassword, password))) {
            throw new ForbiddenException('Access Denied');
        }

        const tokens = await this.generateTokens({ userId: user.id });
        await this.updateRefreshToken(user.id, tokens.refresh_token);
        return tokens;
    }

    async logout(userId: string): Promise<void> {
        const { count } = await this.prisma.user.updateMany({
            where: {
                id: userId,
                refreshToken: {
                    not: null,
                },
            },
            data: {
                refreshToken: null,
            },
        });

        if (!count) {
            throw new BadRequestException('Already logout');
        }
    }

    async refreshToken(userId: string, refreshToken: string): Promise<Tokens> {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId,
            },
        });

        if (!user) {
            throw new ForbiddenException('Access Denied');
        }

        if (!(await compare(refreshToken, user.refreshToken))) {
            throw new ForbiddenException('Access Denied');
        }

        const tokens = await this.generateTokens({ userId: user.id });
        await this.updateRefreshToken(user.id, tokens.refresh_token);
        return tokens;
    }

    //Các hàm phụ

    // Hàm cập nhật refresh-token trong bảng Users
    async updateRefreshToken(userId: string, refreshToken: string) {
        await this.prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                refreshToken: await hash(refreshToken),
            },
        });
    }

    // Hàm sinh ra access-token và refresh-token
    async generateTokens(payload: IPayloadToken): Promise<Tokens> {
        const [at, rt] = await Promise.all([
            this.jwtService.signAsync(
                {
                    sub: payload.userId,
                },
                {
                    secret: this.securityConfig.jwtSecret,
                    expiresIn: this.securityConfig.jwtExpire,
                },
            ),
            this.jwtService.signAsync(
                {
                    sub: payload.userId,
                },
                {
                    secret: this.securityConfig.refreshSecret,
                    expiresIn: this.securityConfig.refreshExpire,
                },
            ),
        ]);

        return {
            access_token: at,
            refresh_token: rt,
        };
    }

    async sendEmail(body: ForgotPasswordDTO) {
        const { email } = body;
        const user = await this.userService.findUserByVerifiedEmail(email);
        if (!user) {
            throw new BadRequestException('User not found');
        }

        const token = crypto.randomBytes(32).toString('hex');
        const link = `${this.config.get('BASE_URL_CLIENT')}/forgot-password/?token=${token}&email=${email}`;

        await this.prisma.token.upsert({
            where: {
                email,
            },
            update: {
                token,
            },
            create: {
                email,
                token,
            },
        });

        const template = 'send-email-forgot-password.hbs';
        const path = join(__dirname, 'src/templates', template);
        let contentFile = fs.readFileSync(path, 'utf-8');
        contentFile = contentFile.replace('{{link}}', link);
        contentFile = contentFile.replace('{{link}}', link);
        contentFile = contentFile.replace('{{link}}', link);
        contentFile = contentFile.replace('{{name}}', user.fullname);

        return this.mailService.sendMail({
            to: email,
            subject: 'Thiết lập lại mật khẩu đăng nhập MyShop',
            html: contentFile,
        });
    }
}
