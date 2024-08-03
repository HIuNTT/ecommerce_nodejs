import { IPaginationMeta } from './interface';
import { Pagination } from './pagination';

export function createPagination<T>({
    items,
    totalCount,
    currentPage,
    limit,
}: {
    items: T[];
    totalCount: number;
    currentPage: number;
    limit: number;
}): Pagination<T> {
    const totalPage = totalCount !== undefined ? Math.ceil(totalCount / limit) : undefined;

    const meta: IPaginationMeta = {
        totalCount,
        totalPage,
        perPage: limit,
        currentPage,
    };

    return new Pagination<T>(meta, items);
}
