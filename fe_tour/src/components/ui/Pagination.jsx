import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// --- Hằng số ---
const DOTS = '...';

/**
 * Hàm tiện ích (helper) để tạo ra dải phân trang.
 * Logic này sẽ tạo ra một mảng như: [1, '...', 4, 5, 6, '...', 10]
 * @param {number} currentPage - Trang hiện tại
 * @param {number} totalPages - Tổng số trang
 * @param {number} siblingCount - Số trang lân cận (sibling) hiển thị ở mỗi bên của trang hiện tại
 * @returns {Array<number | string>}
 */
const generatePaginationRange = (currentPage, totalPages, siblingCount = 1) => {
  // Tổng số vị trí sẽ hiển thị (ví dụ: 1 ... 4 5 6 ... 10)
  // 1 (Trang đầu) + 1 (Trang cuối) + 1 (Trang hiện tại) + 2 * siblingCount + 2 (dấu '...')
  const totalPageNumbers = siblingCount + 5;

  // --- Trường hợp 1: Tổng số trang nhỏ hơn số lượng ta muốn hiển thị ---
  // (ví dụ: totalPages = 5, totalPageNumbers = 7) -> Hiển thị [1, 2, 3, 4, 5]
  if (totalPages <= totalPageNumbers) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // --- Trường hợp 2: Tổng số trang lớn, cần dấu '...' ---
  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const shouldShowLeftDots = leftSiblingIndex > 2;
  const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

  const firstPageIndex = 1;
  const lastPageIndex = totalPages;

  // 2a: Không hiển thị dấu '...' bên trái
  if (!shouldShowLeftDots && shouldShowRightDots) {
    let leftItemCount = 3 + 2 * siblingCount;
    let leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
    return [...leftRange, DOTS, lastPageIndex];
  }

  // 2b: Không hiển thị dấu '...' bên phải
  if (shouldShowLeftDots && !shouldShowRightDots) {
    let rightItemCount = 3 + 2 * siblingCount;
    let rightRange = Array.from({ length: rightItemCount }, (_, i) => lastPageIndex - rightItemCount + i + 1);
    return [firstPageIndex, DOTS, ...rightRange];
  }

  // 2c: Hiển thị cả hai dấu '...' (ở giữa)
  if (shouldShowLeftDots && shouldShowRightDots) {
    let middleRange = Array.from({ length: 2 * siblingCount + 1 }, (_, i) => leftSiblingIndex + i);
    return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
  }
  
  // Mặc định (dự phòng)
  return [];
};

/**
 * Component Pagination (Phân trang) có thể tái sử dụng.
 *
 * @param {object} props
 * @param {function} props.onPageChange - Hàm callback được gọi khi thay đổi trang, trả về số trang mới.
 * @param {number} props.currentPage - Trang hiện tại.
 * @param {number} props.totalPages - Tổng số trang.
 * @param {number} props.totalItems - Tổng số mục (ví dụ: 24 tours).
 * @param {number} [props.itemsPerPage=12] - Số mục trên mỗi trang (để tính toán văn bản).
 * @param {number} [props.siblingCount=1] - Số trang lân cận hiển thị.
 */
const Pagination = ({
  onPageChange,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage = 12, // Phải khớp với 'limit' trong TourListPage.jsx
  siblingCount = 1
}) => {
  // Nếu chỉ có 1 trang hoặc không có trang nào, không hiển thị phân trang
  if (totalPages <= 1) {
    return null;
  }

  // Tạo dải phân trang
  const paginationRange = generatePaginationRange(currentPage, totalPages, siblingCount);

  // Tính toán văn bản "Hiển thị X đến Y"
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Xử lý các nút Bấm
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

  // Lớp CSS chung cho nút bấm (dựa trên ListTour.html)
  const baseButtonClass = "px-3 py-1 border border-slate-200 rounded-md text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-700";
  const activeButtonClass = "bg-primary text-white hover:bg-primary/90 hover:text-white";

  return (
    <div className="flex items-center justify-between border-t border-slate-200 pt-4">
      
      {/* 1. Văn bản thông tin */}
      <p className="text-sm text-slate-500">
        Hiển thị <span className="font-medium text-slate-800">{startItem}</span>
        {' '}đến <span className="font-medium text-slate-800">{endItem}</span>
        {' '}trong tổng số <span className="font-medium text-slate-800">{totalItems}</span> tours
      </p>

      {/* 2. Các nút phân trang */}
      <div className="flex gap-2">
        {/* Nút "Trước" */}
        <button
          onClick={onPrevious}
          disabled={currentPage === 1}
          className={`${baseButtonClass} flex items-center gap-1`}
        >
          <ChevronLeft className="w-4 h-4" />
          Trước
        </button>

        {/* Dải số trang */}
        {paginationRange.map((pageNumber, index) => {
          // Nếu là dấu '...'
          if (pageNumber === DOTS) {
            return (
              <span
                key={`dots-${index}`}
                className="px-3 py-1 text-slate-500"
              >
                &#8230;
              </span>
            );
          }

          // Nếu là Nút số
          return (
            <button
              key={pageNumber}
              onClick={() => onPageChange(pageNumber)}
              className={`${baseButtonClass} ${
                pageNumber === currentPage ? activeButtonClass : ''
              }`}
            >
              {pageNumber}
            </button>
          );
        })}

        {/* Nút "Sau" */}
        <button
          onClick={onNext}
          disabled={currentPage === totalPages}
          className={`${baseButtonClass} flex items-center gap-1`}
        >
          Sau
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;