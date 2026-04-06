/**
 * ============================================================================
 * @file        source-domain-section.tsx
 * @description Z0 소스를 도메인별 섹션으로 묶어 렌더링하는 컴포넌트.
 * @zone        Z0
 * @domain      System
 *
 * @dependencies @/components/z0/source-list-row, @/lib/design-tokens
 * @called_by   app/z0/page.tsx
 * @feeds_to    -
 *
 * @strict_rule 300라인 제한 준수.
 * ============================================================================
 */
'use client';

import { SOURCE_SECTION_COLORS, SOURCE_SECTION_LABELS, type SourceSectionKey } from '@/lib/design-tokens';
import type { SysDataSource } from '@/types/system';
import { SourceListRow } from './source-list-row';

interface SourceDomainSectionProps {
  sectionKey: SourceSectionKey;
  sources: SysDataSource[];
}

export function SourceDomainSection({ sectionKey, sources }: SourceDomainSectionProps) {
  const sectionColor = SOURCE_SECTION_COLORS[sectionKey];
  const runningCount = sources.filter((source) => source.runStatus === 'running').length;

  return (
    <section
      className="overflow-hidden rounded-2xl border border-[#E8ECEF] bg-white shadow-sm"
      style={{ borderLeftColor: sectionColor.accent, borderLeftWidth: 4 }}
    >
      <div className="flex flex-wrap items-center gap-3 border-b border-[#F1F5F9] px-5 py-3.5">
        <span
          className="rounded-full px-3 py-1 text-[10px] font-semibold tracking-[0.08em]"
          style={{ backgroundColor: sectionColor.soft, color: sectionColor.accent }}
        >
          {SOURCE_SECTION_LABELS[sectionKey]}
        </span>
        <span className="text-[13px] font-semibold text-[#1A1D23]">
          소스 {sources.length}개
        </span>
        <span className="text-[13px] text-[#636E72]">
          실행 중 {runningCount}개
        </span>
      </div>

      <div className="divide-y divide-[#F1F5F9]">
        {sources.map((source) => (
          <SourceListRow key={source.sourceId} source={source} />
        ))}
      </div>
    </section>
  );
}
