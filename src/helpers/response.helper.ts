export class successResponse<T> {
    data: T | T[];
    status: number;
    message: string;

    constructor(data: T | T[], status: number, message: string) {
        this.data = data;
        this.status = status;
        this.message = message;

        return this;
    }
}

export class errorResponse {
    status: number;
    message: string;

    constructor(status: number, message: string) {
        this.status = status;
        this.message = message;

        return this;
    }
}
