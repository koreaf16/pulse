/**
 * ============================================================================
 * @file        source-card.tsx
 * @description 개별 데이터 소스 카드 — 상태, 토글, 마지막 수집 시간 표시.
 * @zone        Z0
 * @domain      System
 *
 * @dependencies @/components/ui/status-badge, @/components/ui/toggle-switch
 * @called_by   source-grid
 * @feeds_to    -
 *
 * @strict_rule 300라인 제한 준수.
 * ============================================================================
 */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { StatusBadge } from '@/components/ui/status-badge';
import { ToggleSwitch } from '@/components/ui/toggle-switch';
import { PROVIDER_LABELS } from '@/lib/design-tokens';
import { timeAgo, toETString } from '@/lib/utils';
import type { SysDataSource } from '@/types/system';

interface SourceCardProps {
  source: SysDataSource;
}

const PROVIDER_COLORS: Record<string, string> = {
  binance: '#F0B90B',
  fred: '#1B4F72',
  coingecko: '#8DC647',
  rss: '#FF6600',
  yahoo: '#6001D2',
};

export function SourceCard({ source }: SourceCardProps) {
  const [isActive, setIsActive] = useState(source.isActive);
  const providerColor = PROVIDER_COLORS[source.providerType] ?? '#636E72';

  return (
    <div className="flex flex-col rounded-xl bg-white p-5 shadow-sm border border-[#E8ECEF] hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          {/* Provider dot */}
          <div
            className="mt-0.5 h-8 w-8 flex-shrink-0 rounded-lg flex items-center justify-center text-white text-[10px] font-bold"
            style={{ backgroundColor: providerColor }}
          >
            {source.providerType.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#1A1D23] leading-snug line-clamp-2">
              {source.sourceName}
            </p>
            <p className="mt-0.5 text-[11px] text-[#636E72]">
              {PROVIDER_LABELS[source.providerType]}
            </p>
          </div>
        </div>
        <ToggleSwitch
          checked={isActive}
          onChange={setIsActive}
          size="sm"
          label={`Toggle ${source.sourceName}`}
        />
      </div>

      {/* Status */}
      <div className="mt-3">
        <StatusBadge status={source.runStatus} size="sm" />
      </div>

      {/* Error message */}
      {source.lastErrorMsg && (
        <div className="mt-2 rounded-lg bg-[#FFEAEA] px-3 py-2">
          <p className="text-[11px] text-[#D63031] leading-snug line-clamp-2">
            {source.lastErrorMsg}
          </p>
        </div>
      )}

      {/* Timestamps */}
      <div className="mt-3 space-y-1 border-t border-[#F5F6FA] pt-3">
        {source.lastSuccessAt && (
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#636E72]">Last success</span>
            <span className="font-data text-[11px] text-[#1A1D23]">
              {timeAgo(source.lastSuccessAt)}
            </span>
          </div>
        )}
        {source.lastErrorAt && (
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#636E72]">Last error</span>
            <span className="font-data text-[11px] text-[#D63031]">
              {toETString(source.lastErrorAt, { hour: '2-digit', minute: '2-digit', hour12: false })}
            </span>
          </div>
        )}
      </div>

      {/* Footer link */}
      <div className="mt-3 flex items-center justify-end">
        <Link
          href={`/z0/explore?source=${source.sourceId}`}
          className="text-[11px] text-[#0984E3] hover:underline"
        >
          View Data →
        </Link>
      </div>
    </div>
  );
}
