/**
 * ============================================================================
 * @file        tab-bar.tsx
 * @description 페이지 내 콘텐츠 탭 전환 컴포넌트.
 * @zone        INFRA
 * @domain      System
 *
 * @dependencies @/lib/utils
 * @called_by   z0/explore/table-tabs, z1/feature-explorer
 * @feeds_to    -
 *
 * @strict_rule 300라인 제한 준수.
 * ============================================================================
 */
'use client';

import { cn } from '@/lib/utils';

export interface TabItem {
  key: string;
  label: string;
  count?: number;
  color?: string;  // hex color
}

interface TabBarProps {
  tabs: TabItem[];
  activeKey: string;
  onTabChange: (key: string) => void;
  variant?: 'underline' | 'pill';
  className?: string;
}

export function TabBar({
  tabs,
  activeKey,
  onTabChange,
  variant = 'underline',
  className,
}: TabBarProps) {
  if (variant === 'pill') {
    return (
      <div className={cn('flex flex-wrap gap-1.5', className)}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
              activeKey === tab.key
                ? 'bg-[#0984E3] text-white'
                : 'bg-[#F5F6FA] text-[#636E72] hover:bg-[#E8ECEF]'
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                  activeKey === tab.key
                    ? 'bg-white/20 text-white'
                    : 'bg-[#E8ECEF] text-[#636E72]'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('flex border-b border-[#E8ECEF]', className)}>
      {tabs.map((tab) => {
        const isActive = activeKey === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={cn(
              'relative px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap',
              isActive
                ? 'text-[#1A1D23]'
                : 'text-[#636E72] hover:text-[#1A1D23]'
            )}
          >
            <span className="flex items-center gap-1.5">
              {tab.color && (
                <span
                  className="h-2 w-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: tab.color }}
                />
              )}
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-1 rounded-full bg-[#F5F6FA] px-1.5 py-0.5 text-[10px] text-[#636E72]">
                  {tab.count.toLocaleString()}
                </span>
              )}
            </span>
            {isActive && (
              <span
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                style={{ backgroundColor: tab.color ?? '#0984E3' }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
