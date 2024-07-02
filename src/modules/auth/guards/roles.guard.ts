import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ROLES } from 'src/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        // sẽ lấy ra @RolesGuard sẽ thực hiện việc lấy ra danh sách role ở trình trang trí @Roles('...')
        const roles: string[] = this.reflector.getAllAndOverride(ROLES, [context.getHandler(), context.getClass()]);

        const request = context.switchToHttp().getRequest();
        return roles.some((role) => role.includes(request.user.role as unknown as string));
    }
}
