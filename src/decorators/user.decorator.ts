import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { DecodePayload } from '../interfaces';

export const UserId = createParamDecorator((data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const user = request.user as DecodePayload;
    return user.sub;
});
