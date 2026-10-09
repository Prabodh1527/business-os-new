import { Inbox } from 'lucide-react';
import Button from './Button';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'Nothing here yet',
  description,
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-14 px-6 ${className}`}>
      <div className="w-14 h-14 rounded-full bg-surface-card-hover flex items-center justify-center mb-4">
        <Icon size={24} className="text-ink-muted" />
      </div>
      <h4 className="font-display font-semibold text-ink-primary text-base mb-1">{title}</h4>
      {description && (
        <p className="text-ink-secondary text-sm max-w-sm mb-5">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}