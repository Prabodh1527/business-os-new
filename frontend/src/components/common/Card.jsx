export default function Card({
  children,
  title,
  subtitle,
  action,
  footer,
  padded = true,
  className = '',
}) {
  const hasHeader = title || subtitle || action;

  return (
    <div
      className={`bg-surface-card border border-surface-border rounded-lg shadow-sm ${className}`}
    >
      {hasHeader && (
        <div className="flex items-start justify-between px-5 py-4 border-b border-surface-border">
          <div>
            {title && <h3 className="font-display font-semibold text-ink-primary text-base">{title}</h3>}
            {subtitle && <p className="text-ink-secondary text-xs mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}

      <div className={padded ? 'p-5' : ''}>{children}</div>

      {footer && (
        <div className="px-5 py-3 border-t border-surface-border bg-surface-bg/50 rounded-b-lg">
          {footer}
        </div>
      )}
    </div>
  );
}