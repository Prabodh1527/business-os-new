import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';

export default function SearchInput({
  placeholder = 'Search...',
  onSearch,
  delay = 350,
  className = '',
}) {
  const [value, setValue] = useState('');
  const debounced = useDebounce(value, delay);

  useEffect(() => {
    onSearch?.(debounced);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <div className={`relative ${className}`}>
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 pl-9 pr-9 rounded-md border border-surface-border bg-surface-card
          text-sm text-ink-primary placeholder:text-ink-muted
          focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
      />
      {value && (
        <button
          onClick={() => setValue('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-primary"
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}