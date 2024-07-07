export interface Filters {
    itemsPerPage?: number;
    page?: number;
    search?: string;
}

export interface PaginationResult<T> {
    count: number;
    total_pages: number;
    current_page: number;
    data: T[];
}
