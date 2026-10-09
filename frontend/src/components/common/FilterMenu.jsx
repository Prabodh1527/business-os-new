import { useEffect, useRef, useState } from 'react';
import { SlidersHorizontal, Check } from 'lucide-react';

export default function FilterMenu({
  label = 'Filter',
  options = [], // [{ value, label }]
  selected = [],
  onChange,
  multiple = true,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function toggle(value) {
    if (!multiple) {
      onChange([value]);
      setOpen(false);
      return;
    }
    const next = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    onChange(next);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 h-10 px-3.5 rounded-md border text-sm font-medium
          ${selected.length > 0
            ? 'border-brand-500 text-brand-500 bg-brand-50'
            : 'border-surface-border text-ink-secondary hover:bg-surface-card-hover'
          }`}
      >
        <SlidersHorizontal size={14} />
        {label}
        {selected.length > 0 && (
          <span className="w-4 h-4 rounded-full bg-brand-500 text-white text-[10px] flex items-center justify-center font-mono-num">
            {selected.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-surface-card border border-surface-border rounded-md shadow-lg z-20 py-1">
          {options.map((opt) => {
            const isActive = selected.includes(opt.value);
            return (
              <button
                key={opt.value}
                onClick={() => toggle(opt.value)}
                className="w-full flex items-center justify-between px-3.5 py-2 text-sm text-ink-primary hover:bg-surface-card-hover"
              >
                {opt.label}
                {isActive && <Check size={14} className="text-brand-500" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}