import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ISecurityConfig, SecurityConfig } from '~/configs/security.config';
import { PrismaService } from '~/shared/prisma/prisma.service';

type JwtPayload = {
    sub: string;
};

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        @Inject(SecurityConfig.KEY) private securityConfig: ISecurityConfig,
        private prisma: PrismaService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: securityConfig.jwtSecret,
        });
    }

    // sau khi giải mã sẽ đưa phần payload vào biến payload bên dưới, để lấy ra thì req.user
    async validate(payload: JwtPayload) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: payload.sub,
                isActived: true,
            },
            select: {
                role: true,
            },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid token');
        }

        return {
            ...payload,
            role: user.role,
        }; // express sẽ req.user = payload
    }
}
