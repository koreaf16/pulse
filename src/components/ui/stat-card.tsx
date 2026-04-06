/**
 * ============================================================================
 * @file        stat-card.tsx
 * @description 단일 통계 수치를 표시하는 작은 카드 컴포넌트.
 * @zone        INFRA
 * @domain      System
 *
 * @dependencies @/lib/utils
 * @called_by   zone-status-row, feature-card
 * @feeds_to    -
 *
 * @strict_rule 300라인 제한 준수.
 * ============================================================================
 */
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function StatCard({
  label,
  value,
  subValue,
  trend,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg bg-[#F5F6FA] px-3 py-2.5',
        className
      )}
    >
      <p className="text-[11px] text-[#636E72] font-medium uppercase tracking-wide">
        {label}
      </p>
      <p className="mt-0.5 font-data text-base font-semibold text-[#1A1D23] leading-tight">
        {value}
      </p>
      {subValue && (
        <p
          className={cn(
            'mt-0.5 text-xs font-medium',
            trend === 'up' && 'text-[#00B894]',
            trend === 'down' && 'text-[#D63031]',
            trend === 'neutral' && 'text-[#636E72]',
            !trend && 'text-[#636E72]'
          )}
        >
          {trend === 'up' && '↑ '}
          {trend === 'down' && '↓ '}
          {subValue}
        </p>
      )}
    </div>
  );
}
