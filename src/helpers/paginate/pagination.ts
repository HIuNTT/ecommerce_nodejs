import { IPaginationMeta } from './interface';

export class Pagination<PaginationObject, T = IPaginationMeta> {
    constructor(
        public readonly meta: T,
        public readonly items: PaginationObject[],
    ) {}
}
