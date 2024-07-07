import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/modules/prisma/prisma.service';

type JwtPayload = {
    sub: string;
};

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        config: ConfigService,
        private prisma: PrismaService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.get('AT_SECRET'),
        });
    }

    // sau khi giải mã sẽ đưa phần payload vào biến payload bên dưới, để lấy ra thì req.user
    async validate(payload: JwtPayload) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: payload.sub,
            },
            select: {
                role: true,
            },
        });

        return {
            ...payload,
            role: user.role,
        }; // express sẽ req.user = payload
    }
}
