import { ApiProperty } from '@nestjs/swagger';

export class ResOp<T = any> {
    @ApiProperty({ type: 'object' })
    data?: T;

    @ApiProperty({ type: 'number', default: 200 })
    statusCode: number;

    @ApiProperty({ type: 'string', default: 'Success' })
    message: string;

    constructor(statusCode: number = 200, data: T, message: string = 'Success') {
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
    }
}

export class TreeResult<T> {
    @ApiProperty()
    id: number;

    @ApiProperty()
    parentId: number;

    @ApiProperty()
    children?: TreeResult<T>[];
}
