import { useCallback, useMemo,useState } from 'react';

export interface PaginationOptions {
  initialPage?: number;
  pageSize?: number;
  totalItems: number;
}

export interface PaginationResult {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  canGoPrev: boolean;
  canGoNext: boolean;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  /**
   * Props object for spreading onto pagination components
   */
  props: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}

/**
 * Pagination state management hook
 * Returns stable callbacks and derived state for pagination components
 * 
 * @example
 * ```tsx
 * const pagination = usePagination({ totalItems: 100, pageSize: 10 });
 * <Table data={items.slice(pagination.startIndex, pagination.endIndex)} />
 * <Pagination {...pagination.props} />
 * ```
 */
export function usePagination({
  initialPage = 1,
  pageSize = 10,
  totalItems,
}: PaginationOptions): PaginationResult {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const totalPages = Math.ceil(totalItems / pageSize);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const goToPage = useCallback(
    (page: number) => {
      const clampedPage = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(clampedPage);
    },
    [totalPages]
  );

  const nextPage = useCallback(() => {
    if (canGoNext) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [canGoNext]);

  const prevPage = useCallback(() => {
    if (canGoPrev) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [canGoPrev]);

  const props = useMemo(
    () => ({
      currentPage,
      totalPages,
      onPageChange: goToPage,
    }),
    [currentPage, totalPages, goToPage]
  );

  return {
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    startIndex,
    endIndex,
    canGoPrev,
    canGoNext,
    goToPage,
    nextPage,
    prevPage,
    props,
  };
}
