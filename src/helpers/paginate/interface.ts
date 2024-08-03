export interface IPaginationMeta {
    totalCount: number;
    totalPage: number;
    perPage: number;
    currentPage: number;
}

export interface IPaginationLinks {
    firstPageUrl: string;
    lastPageUrl: string;
    nextPageUrl: string;
    previousPageUrl: string;
}
