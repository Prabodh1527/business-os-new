import { AlertTriangle } from 'lucide-react';
import Button from './Button';

export default function ErrorState({
  title = "Couldn't load this",
  description = 'Something went wrong while fetching this data.',
  onRetry,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-14 px-6 ${className}`}>
      <div className="w-14 h-14 rounded-full bg-danger-100 flex items-center justify-center mb-4">
        <AlertTriangle size={24} className="text-danger-500" />
      </div>
      <h4 className="font-display font-semibold text-ink-primary text-base mb-1">{title}</h4>
      <p className="text-ink-secondary text-sm max-w-sm mb-5">{description}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}