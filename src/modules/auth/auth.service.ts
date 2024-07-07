import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { RegisterDTO } from './dto';
import { compare, hash } from '../../helpers/encryption.helper';
import { IPayloadToken, Tokens } from './interfaces';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginDTO } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private config: ConfigService,
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

    async login({ username, reqPassword }: LoginDTO): Promise<Tokens> {
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

        if (!(await compare(reqPassword, password))) {
            throw new ForbiddenException('Access Denied');
        }

        const tokens = await this.generateTokens({ userId: user.id });
        await this.updateRefreshToken(user.id, tokens.refresh_token);
        return tokens;
    }

    async logout(userId: string) {
        try {
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
        } catch (error) {
            throw error;
        }
    }

    async refreshToken(userId: string, refreshToken: string) {
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
                    secret: this.config.get('AT_SECRET'),
                    expiresIn: '15m',
                },
            ),
            this.jwtService.signAsync(
                {
                    sub: payload.userId,
                },
                {
                    secret: this.config.get('RT_SECRET'),
                    expiresIn: '7d',
                },
            ),
        ]);

        return {
            access_token: at,
            refresh_token: rt,
        };
    }
}
