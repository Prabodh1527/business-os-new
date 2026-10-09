const SIZES = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
};

// Deterministic color from name so the same person always gets the same
// fallback color across sessions, without storing anything extra.
const PALETTE = ['bg-brand-500', 'bg-info-500', 'bg-success-500', 'bg-insight-600', 'bg-danger-500'];

function colorForName(name = '') {
  const sum = [...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return PALETTE[sum % PALETTE.length];
}

function initials(name = '') {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Avatar({ name, src, size = 'md', className = '' }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name || 'avatar'}
        className={`${SIZES[size]} rounded-full object-cover flex-shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${SIZES[size]} ${colorForName(name)} rounded-full flex items-center justify-center
        text-white font-medium flex-shrink-0 ${className}`}
      title={name}
    >
      {initials(name)}
    </div>
  );
}