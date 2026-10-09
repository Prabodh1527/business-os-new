import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import Skeleton from './Skeleton';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';

/**
 * columns: [{ key, header, render?: (row) => node, sortable?: bool, align?: 'left'|'right'|'center' }]
 * rows: array of data objects (must include a unique `id`)
 */
export default function DataTable({
  columns,
  rows = [],
  loading = false,
  error = null,
  onRetry,
  onRowClick,
  emptyTitle = 'No records yet',
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
  defaultSort,
}) {
  const [sort, setSort] = useState(defaultSort || null); // { key, direction }

  function handleSort(key) {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, direction: 'asc' };
      if (prev.direction === 'asc') return { key, direction: 'desc' };
      return null;
    });
  }

  const sortedRows = sort
    ? [...rows].sort((a, b) => {
        const va = a[sort.key];
        const vb = b[sort.key];
        if (va === vb) return 0;
        const result = va > vb ? 1 : -1;
        return sort.direction === 'asc' ? result : -result;
      })
    : rows;

  const alignClass = (align) =>
    align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-surface-border">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 font-medium text-ink-secondary text-xs uppercase tracking-wide ${alignClass(col.align)}
                  ${col.sortable ? 'cursor-pointer select-none hover:text-ink-primary' : ''}`}
                onClick={() => col.sortable && handleSort(col.key)}
              >
                <span className="inline-flex items-center gap-1">
                  {col.header}
                  {col.sortable && sort?.key === col.key && (
                    sort.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>

        {!loading && !error && rows.length > 0 && (
          <tbody>
            {sortedRows.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row)}
                className={`border-b border-surface-border last:border-0
                  ${onRowClick ? 'cursor-pointer hover:bg-surface-card-hover' : ''}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-3 text-ink-primary ${alignClass(col.align)}`}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        )}

        {loading && (
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={`skeleton-${i}`} className="border-b border-surface-border">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    <Skeleton height="14px" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        )}
      </table>

      {!loading && error && <ErrorState onRetry={onRetry} description={error} />}

      {!loading && !error && rows.length === 0 && (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          actionLabel={emptyActionLabel}
          onAction={onEmptyAction}
        />
      )}
    </div>
  );
}