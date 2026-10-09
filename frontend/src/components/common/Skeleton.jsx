function Base({ className = '' }) {
  return (
    <div
      className={`animate-pulse bg-surface-card-hover rounded-md ${className}`}
    />
  );
}

export default function Skeleton({ variant = 'text', width, height, count = 1, className = '' }) {
  const items = Array.from({ length: count });

  if (variant === 'circle') {
    return <Base className={`rounded-full ${className}`} style={{ width, height: height || width }} />;
  }

  if (variant === 'block') {
    return <Base className={className} style={{ width: width || '100%', height: height || '120px' }} />;
  }

  // text — stacked lines, last line shorter for a natural look
  return (
    <div className="flex flex-col gap-2">
      {items.map((_, i) => (
        <Base
          key={i}
          className={className}
          style={{
            width: width || (i === items.length - 1 && count > 1 ? '60%' : '100%'),
            height: height || '12px',
          }}
        />
      ))}
    </div>
  );
}