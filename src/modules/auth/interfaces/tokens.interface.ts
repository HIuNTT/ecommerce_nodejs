import { ApiProperty } from '@nestjs/swagger';

export class Token {
    @ApiProperty({ description: 'Access token JWT' })
    access_token: string;
}

export interface ITokens {
    access_token: string;
    refresh_token: string;
}

export interface IPayloadToken {
    userId: string;
}

export type JwtPayload = {
    sub: string;
};
