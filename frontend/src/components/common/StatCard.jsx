import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

// Static class map — Tailwind's JIT scanner needs literal class names,
// not template strings, or it purges them from the build.
const ACCENT_STYLES = {
  brand: { bg: 'bg-brand-50', text: 'text-brand-500' },
  insight: { bg: 'bg-insight-300/30', text: 'text-insight-600' },
  success: { bg: 'bg-success-100', text: 'text-success-500' },
  danger: { bg: 'bg-danger-100', text: 'text-danger-500' },
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  trend, // e.g. { direction: 'up' | 'down', value: '12%' }
  accent = 'brand', // 'brand' | 'insight' | 'success' | 'danger'
  className = '',
}) {
  const trendUp = trend?.direction === 'up';
  const accentStyle = ACCENT_STYLES[accent] || ACCENT_STYLES.brand;

  return (
    <div className={`bg-surface-card border border-surface-border rounded-lg p-5 ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-ink-secondary text-xs font-medium uppercase tracking-wide">{label}</p>
        {Icon && (
          <div className={`w-9 h-9 rounded-md flex items-center justify-center ${accentStyle.bg}`}>
            <Icon size={16} className={accentStyle.text} />
          </div>
        )}
      </div>

      <p className="font-mono text-2xl font-semibold text-ink-primary tabular-nums">{value}</p>

      {trend && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${
          trendUp ? 'text-success-500' : 'text-danger-500'
        }`}>
          {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          <span className="font-mono-num">{trend.value}</span>
          <span className="text-ink-muted font-normal">vs last period</span>
        </div>
      )}
    </div>
  );
}