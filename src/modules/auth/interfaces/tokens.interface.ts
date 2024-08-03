import { ApiProperty } from '@nestjs/swagger';

export class Tokens {
    @ApiProperty({ description: 'Access token JWT' })
    access_token: string;

    @ApiProperty({ description: 'Refresh token JWT' })
    refresh_token: string;
}

export interface IPayloadToken {
    userId: string;
}
