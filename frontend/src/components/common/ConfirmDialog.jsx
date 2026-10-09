import { AlertTriangle } from 'lucide-react';
import Button from './Button';

export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger', // 'danger' | 'primary'
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      onClick={onCancel}
    >
      <div
        className="bg-surface-card rounded-lg shadow-lg w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {variant === 'danger' && (
          <div className="w-10 h-10 rounded-full bg-danger-100 flex items-center justify-center mb-4">
            <AlertTriangle size={18} className="text-danger-500" />
          </div>
        )}

        <h3 className="font-display font-semibold text-ink-primary text-base mb-1.5">{title}</h3>
        {description && <p className="text-ink-secondary text-sm mb-6">{description}</p>}

        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={variant} size="sm" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}