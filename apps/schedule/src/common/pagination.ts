export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

export interface PaginationArguments {
  page: number;
  limit: number;
  skip: number;
  take: number;
}

export interface PageInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export function normalizePagination(
  page = DEFAULT_PAGE,
  limit = DEFAULT_LIMIT,
): PaginationArguments {
  const normalizedPage =
    Number.isInteger(page) && page > 0 ? page : DEFAULT_PAGE;
  const normalizedLimit =
    Number.isInteger(limit) && limit > 0
      ? Math.min(limit, MAX_LIMIT)
      : DEFAULT_LIMIT;

  return {
    page: normalizedPage,
    limit: normalizedLimit,
    skip: (normalizedPage - 1) * normalizedLimit,
    take: normalizedLimit,
  };
}

export function createPageInfo(
  totalCount: number,
  page: number,
  limit: number,
): PageInfo {
  const totalPages = Math.ceil(totalCount / limit);

  return {
    page,
    limit,
    totalCount,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1 && totalPages > 0,
  };
}
