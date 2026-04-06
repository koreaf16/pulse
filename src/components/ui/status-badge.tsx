/**
 * ============================================================================
 * @file        status-badge.tsx
 * @description RunStatus 상태를 색상 dot + 레이블로 표시하는 배지 컴포넌트.
 * @zone        INFRA
 * @domain      System
 *
 * @dependencies @/lib/design-tokens, @/types/common, @/lib/utils
 * @called_by   source-list-row, zone-status-row, feature-card
 * @feeds_to    -
 *
 * @strict_rule 300라인 제한 준수.
 * ============================================================================
 */
import { STATUS_STYLES } from '@/lib/design-tokens';
import type { RunStatus } from '@/types/common';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: RunStatus;
  size?: 'sm' | 'md';
  showDot?: boolean;
  className?: string;
}

export function StatusBadge({
  status,
  size = 'md',
  showDot = true,
  className,
}: StatusBadgeProps) {
  const styles = STATUS_STYLES[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
        styles.badge,
        styles.text,
        className
      )}
    >
      {showDot && (
        <span
          className={cn(
            'rounded-full flex-shrink-0',
            size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2',
            styles.dot,
            status === 'running' && 'animate-pulse'
          )}
        />
      )}
      {styles.label}
    </span>
  );
}
