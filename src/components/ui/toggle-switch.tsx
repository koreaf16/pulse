/**
 * ============================================================================
 * @file        toggle-switch.tsx
 * @description 소스 활성/비활성 제어용 토글 스위치 컴포넌트.
 * @zone        INFRA
 * @domain      System
 *
 * @dependencies @/lib/utils
 * @called_by   source-list-row
 * @feeds_to    -
 *
 * @strict_rule 300라인 제한 준수.
 * ============================================================================
 */
'use client';

import { cn } from '@/lib/utils';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  size?: 'sm' | 'md';
}

export function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
  label,
  size = 'md',
}: ToggleSwitchProps) {
  const trackSize = size === 'sm'
    ? 'h-4 w-7'
    : 'h-5 w-9';
  const thumbSize = size === 'sm'
    ? 'h-3 w-3 translate-x-0.5'
    : 'h-3.5 w-3.5 translate-x-0.5';
  const thumbChecked = size === 'sm'
    ? 'translate-x-3.5'
    : 'translate-x-4.5';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
        trackSize,
        checked
          ? 'bg-[#0984E3] focus:ring-[#0984E3]'
          : 'bg-[#B2BEC3] focus:ring-[#B2BEC3]',
        disabled && 'cursor-not-allowed opacity-50'
      )}
    >
      <span
        className={cn(
          'inline-block rounded-full bg-white shadow-sm transition-transform',
          thumbSize,
          checked ? thumbChecked : 'translate-x-0.5'
        )}
      />
    </button>
  );
}
