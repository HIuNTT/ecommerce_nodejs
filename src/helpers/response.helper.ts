export class successResponse<T> {
    data: T | T[];
    statusCode: number;
    message: string;

    constructor(data: T | T[], statusCode: number, message: string) {
        this.message = message;
        this.statusCode = statusCode;
        this.data = data;

        return this;
    }
}

export class errorResponse {
    message: string;
    statusCode: number;

    constructor(statusCode: number, message: string) {
        this.message = message;
        this.statusCode = statusCode;

        return this;
    }
}

export class ResOp<T = any> {
    data?: T;
    statusCode: number;
    message: string;

    constructor(statusCode: number = 200, data: T, message: string = 'Success') {
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
    }
}
