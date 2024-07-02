import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(config: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: config.get('RT_SECRET'),
            ignoreExpiration: false, // Nếu = true thì sẽ vẫn chấp nhận token hết hạn
            passReqToCallback: true,
            // Nếu passReqToCallback = true thì sẽ truyền thông tin của Request vào function validate bên dưới,
            ///do đó validate có thêm tham số là request thay vì chỉ có payload của token
        });
    }

    // sau khi giải mã sẽ đưa phần payload vào biến payload bên dưới, để lấy ra thì req.user
    validate(req: Request, payload: any) {
        const refreshToken = req.headers.authorization?.replace('Bearer', '').trim();

        return {
            ...payload,
            refreshToken,
        }; // express sẽ req.user = {...payload, thêm refresh-token }
    }
}
