import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ISecurityConfig, SecurityConfig } from '~/configs/security.config';
import { JwtPayload } from '../interfaces';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(@Inject(SecurityConfig.KEY) private securityConfig: ISecurityConfig) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([(req: Request) => req.cookies[securityConfig.refreshToken]]),
            secretOrKey: securityConfig.refreshSecret,
            ignoreExpiration: false, // Nếu = true thì sẽ vẫn chấp nhận token hết hạn
            passReqToCallback: true,
            // Nếu passReqToCallback = true thì sẽ truyền thông tin của Request vào function validate bên dưới,
            ///do đó validate có thêm tham số là request thay vì chỉ có payload của token
        });
    }

    // sau khi giải mã sẽ đưa phần payload vào biến payload bên dưới, để lấy ra thì req.user
    validate(req: Request, payload: JwtPayload) {
        const refreshToken = req.cookies[this.securityConfig.refreshToken];

        return {
            ...payload,
            refreshToken,
        }; // express sẽ req.user = {...payload, thêm refresh-token }
    }
}
