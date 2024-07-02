import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from '../../../decorators';

@Injectable()
export class AccessTokenGuard extends AuthGuard('jwt') {
    constructor(private reflector: Reflector) {
        super();
    }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(), // lấy ra method trong controller mà được trang trí @Public
            context.getClass(), // lấy ra class của controller
        ]);

        if (isPublic) {
            return true;
        }

        return super.canActivate(context);
    }
}
