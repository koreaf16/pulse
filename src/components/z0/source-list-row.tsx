/**
 * ============================================================================
 * @file        source-list-row.tsx
 * @description Z0 소스를 한 줄 리스트 행으로 표시하는 컴포넌트.
 * @zone        Z0
 * @domain      System
 *
 * @dependencies next/link, @/components/ui/status-badge, @/components/ui/toggle-switch,
 *               @/lib/design-tokens, @/lib/utils
 * @called_by   source-domain-section.tsx
 * @feeds_to    -
 *
 * @strict_rule
 *   1. 300라인 제한 준수.
 *   2. 상태 변경은 UI 로컬 상태까지만 처리.
 * ============================================================================
 */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { StatusBadge } from '@/components/ui/status-badge';
import { ToggleSwitch } from '@/components/ui/toggle-switch';
import { PROVIDER_COLORS, PROVIDER_LABELS } from '@/lib/design-tokens';
import { timeAgo, toETString } from '@/lib/utils';
import type { SysDataSource } from '@/types/system';

interface SourceListRowProps {
  source: SysDataSource;
}

export function SourceListRow({ source }: SourceListRowProps) {
  const [isActive, setIsActive] = useState(source.isActive);
  const providerColor = PROVIDER_COLORS[source.providerType] ?? '#636E72';

  return (
    <div className="grid gap-3 px-4 py-3.5 lg:grid-cols-[minmax(0,1.35fr)_auto] lg:items-center">
      <div className="min-w-0">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className="mt-0.5 h-8 w-8 flex-shrink-0 rounded-lg"
            style={{ backgroundColor: providerColor }}
            aria-hidden="true"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <p className="truncate text-[13px] font-semibold text-[#1A1D23]">
                {source.sourceName}
              </p>
              <span
                className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{ backgroundColor: `${providerColor}1A`, color: providerColor }}
              >
                {PROVIDER_LABELS[source.providerType] ?? source.providerType}
              </span>
              <span className="font-mono text-[10px] text-[#98A2B3]">
                {source.sourceId}
              </span>
            </div>

            {source.lastErrorMsg && (
              <p className="mt-1 max-w-full truncate rounded-full bg-[#FFF1F1] px-2.5 py-1 text-[11px] text-[#D63031]">
                {source.lastErrorMsg}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 lg:justify-end">
        <StatusBadge status={source.runStatus} size="sm" />

        {source.lastSuccessAt && (
          <span className="rounded-full bg-[#F5F7FA] px-2.5 py-1 text-[11px] text-[#4B5563]">
            최근 성공 {timeAgo(source.lastSuccessAt)}
          </span>
        )}

        {source.lastErrorAt && (
          <span className="rounded-full bg-[#FFF1F1] px-2.5 py-1 text-[11px] text-[#D63031]">
            최근 오류 {toETString(source.lastErrorAt, { hour: '2-digit', minute: '2-digit', hour12: false })}
          </span>
        )}

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-[#636E72]">
            {isActive ? '켜짐' : '꺼짐'}
          </span>
          <ToggleSwitch
            checked={isActive}
            onChange={setIsActive}
            size="sm"
            label={`${source.sourceName} 상태 전환`}
          />
        </div>

        <Link
          href={`/z0/explore?source=${source.sourceId}`}
          className="text-[11px] font-medium text-[#0984E3] hover:underline"
        >
          데이터 보기
        </Link>
      </div>
    </div>
  );
}
