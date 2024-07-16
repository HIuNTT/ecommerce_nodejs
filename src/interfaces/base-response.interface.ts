export interface IBaseResponse<T = any> {
    statusCode: number;
    message: string;
    data?: T;
}
