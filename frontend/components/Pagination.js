import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showSummary = false,
  totalItems = 0,
  itemsPerPage = 10,
}) {
  if (totalPages <= 1) return null;

  // Build page number array with ellipsis
  const buildPages = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = [];
    const delta = 1; // pages around current

    pages.push(1);

    const rangeStart = Math.max(2, currentPage - delta);
    const rangeEnd = Math.min(totalPages - 1, currentPage + delta);

    if (rangeStart > 2) pages.push('...');

    for (let p = rangeStart; p <= rangeEnd; p++) {
      pages.push(p);
    }

    if (rangeEnd < totalPages - 1) pages.push('...');

    pages.push(totalPages);

    return pages;
  };

  const pages = buildPages();

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6">
      {/* Optional summary */}
      {showSummary && totalItems > 0 && (
        <p className="text-gray-400 text-sm">
          Showing <span className="text-white font-medium">{startItem}</span>–
          <span className="text-white font-medium">{endItem}</span> of{' '}
          <span className="text-white font-medium">{totalItems}</span> results
        </p>
      )}

      <div className="flex items-center gap-1">
        {/* Previous */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-700 text-gray-400 hover:border-yellow-500 hover:text-yellow-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150"
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Page numbers */}
        {pages.map((page, idx) =>
          page === '...' ? (
            <span
              key={`ellipsis-${idx}`}
              className="w-9 h-9 flex items-center justify-center text-gray-500 text-sm select-none"
            >
              …
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors duration-150 ${
                page === currentPage
                  ? 'bg-yellow-500 text-black border border-yellow-500'
                  : 'border border-gray-700 text-gray-300 hover:border-yellow-500 hover:text-yellow-400'
              }`}
              aria-label={`Page ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-700 text-gray-400 hover:border-yellow-500 hover:text-yellow-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150"
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
