import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}) {
  if (totalPages <= 1) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  const pageNumbers = getPageWindow(page, totalPages);

  return (
    <div className="flex items-center justify-between flex-wrap gap-3 pt-4">
      <p className="text-xs text-ink-secondary">
        Showing <span className="font-mono-num">{start}-{end}</span> of{' '}
        <span className="font-mono-num">{totalItems}</span>
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="w-8 h-8 flex items-center justify-center rounded-md border border-surface-border
            text-ink-secondary hover:bg-surface-card-hover disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} />
        </button>

        {pageNumbers.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="px-1 text-ink-muted text-sm">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 rounded-md text-sm font-mono-num
                ${p === page
                  ? 'bg-brand-500 text-white'
                  : 'text-ink-secondary hover:bg-surface-card-hover'
                }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-md border border-surface-border
            text-ink-secondary hover:bg-surface-card-hover disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

function getPageWindow(current, total, span = 1) {
  const pages = [];
  const left = Math.max(2, current - span);
  const right = Math.min(total - 1, current + span);

  pages.push(1);
  if (left > 2) pages.push('...');
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < total - 1) pages.push('...');
  if (total > 1) pages.push(total);

  return pages;
}