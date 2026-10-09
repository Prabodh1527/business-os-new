const VARIANTS = {
  neutral: 'bg-surface-card-hover text-ink-secondary',
  brand: 'bg-brand-50 text-brand-600',
  success: 'bg-success-100 text-success-500',
  danger: 'bg-danger-100 text-danger-500',
  warning: 'bg-warning-100 text-warning-500',
  info: 'bg-info-100 text-info-500',
  insight: 'bg-insight-300/40 text-insight-600',
};

const DOT_COLOR = {
  neutral: 'bg-neutral-400',
  brand: 'bg-brand-500',
  success: 'bg-success-500',
  danger: 'bg-danger-500',
  warning: 'bg-warning-500',
  info: 'bg-info-500',
  insight: 'bg-insight-500',
};

export default function Badge({ children, variant = 'neutral', dot = false, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${VARIANTS[variant]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${DOT_COLOR[variant]}`} />}
      {children}
    </span>
  );
}