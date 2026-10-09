import { Loader2 } from 'lucide-react';

const SIZES = { sm: 16, md: 24, lg: 36 };

export default function LoadingSpinner({ size = 'md', label, fullPanel = false, className = '' }) {
  const spinner = (
    <div className={`flex items-center gap-2 text-ink-secondary ${className}`}>
      <Loader2 size={SIZES[size]} className="animate-spin text-brand-500" />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );

  if (!fullPanel) return spinner;

  return (
    <div className="flex items-center justify-center py-16 w-full">
      {spinner}
    </div>
  );
}