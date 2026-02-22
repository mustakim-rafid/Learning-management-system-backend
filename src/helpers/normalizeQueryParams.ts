export interface IPaginationParameters {
    limit: string | number;
    page: string | number;
    sortOrder: "asc" | "desc";
    sortBy: string
}

interface INormalizedPaginationParameters {
    take: number;
    skip: number;
    page: number;
    sortOrder: "asc" | "desc";
    sortBy: string;
}

export const normalizePaginationQueryParams = (paginationParameters: Partial<IPaginationParameters>): INormalizedPaginationParameters => {
    const take = Number(paginationParameters.limit) || 10;
    const page = Number(paginationParameters.page) || 1;
    const skip = take * (page - 1)
    const sortBy = paginationParameters.sortBy || "createdAt"
    const sortOrder = paginationParameters.sortOrder || "desc"

    return {
        take,
        skip,
        page,
        sortBy,
        sortOrder,
    }
}