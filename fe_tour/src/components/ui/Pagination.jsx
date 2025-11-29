import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DOTS = '...';

const generatePaginationRange = (currentPage, totalPages, siblingCount = 1) => {
  const totalPageNumbers = siblingCount + 5;

  if (totalPages <= totalPageNumbers) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const shouldShowLeftDots = leftSiblingIndex > 2;
  const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

  const firstPageIndex = 1;
  const lastPageIndex = totalPages;

  if (!shouldShowLeftDots && shouldShowRightDots) {
    let leftItemCount = 3 + 2 * siblingCount;
    let leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
    return [...leftRange, DOTS, lastPageIndex];
  }

  if (shouldShowLeftDots && !shouldShowRightDots) {
    let rightItemCount = 3 + 2 * siblingCount;
    let rightRange = Array.from({ length: rightItemCount }, (_, i) => lastPageIndex - rightItemCount + i + 1);
    return [firstPageIndex, DOTS, ...rightRange];
  }

  if (shouldShowLeftDots && shouldShowRightDots) {
    let middleRange = Array.from({ length: 2 * siblingCount + 1 }, (_, i) => leftSiblingIndex + i);
    return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
  }
  
  return [];
};

const Pagination = ({
  onPageChange,
  currentPage,
  totalItems = 0,
  itemsPerPage = 10,
  siblingCount = 1
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalItems === 0) return null;

  const paginationRange = generatePaginationRange(currentPage, totalPages, siblingCount);
  
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const onNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const onPrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const baseButtonClass = "px-3 py-1.5 border rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const inactiveClass = "border-gray-300 bg-white text-gray-700 hover:bg-gray-50";
  const activeClass = "bg-blue-50 text-blue-700 border-blue-100 font-semibold";
  const dotsClass = "px-3 py-1.5 text-gray-500";

  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 w-full">
      
      <div className="text-sm text-gray-500">
        Hiển thị <span className="font-medium text-gray-900">{startItem}</span> - <span className="font-medium text-gray-900">{endItem}</span> trên tổng số <span className="font-medium text-gray-900">{totalItems}</span> bản ghi
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onPrevious}
          disabled={currentPage === 1}
          className={`${baseButtonClass} ${inactiveClass} flex items-center gap-1`}
        >
          <ChevronLeft size={16} />
          Trước
        </button>

        <div className="hidden sm:flex gap-1">
          {paginationRange.map((pageNumber, index) => {
            if (pageNumber === DOTS) {
              return <span key={`dots-${index}`} className={dotsClass}>&#8230;</span>;
            }

            return (
              <button
                key={pageNumber}
                onClick={() => onPageChange(pageNumber)}
                className={`${baseButtonClass} ${pageNumber === currentPage ? activeClass : inactiveClass}`}
              >
                {pageNumber}
              </button>
            );
          })}
        </div>

        <button
          onClick={onNext}
          disabled={currentPage === totalPages}
          className={`${baseButtonClass} ${inactiveClass} flex items-center gap-1`}
        >
          Sau
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;