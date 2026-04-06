'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { SourceDomainSection } from '@/components/z0/source-domain-section';
import { StatusBadge } from '@/components/ui/status-badge';
import { fetchSources } from '@/lib/api';
import { PROVIDER_SECTION_MAP, SOURCE_SECTION_ORDER, type SourceSectionKey } from '@/lib/design-tokens';
import type { SysDataSource } from '@/types/system';
import type { RunStatus } from '@/types/common';

interface SourceSection {
  key: SourceSectionKey;
  sources: SysDataSource[];
}

function buildSourceSections(sources: SysDataSource[]): SourceSection[] {
  const grouped = new Map<SourceSectionKey, SysDataSource[]>(
    SOURCE_SECTION_ORDER.map((key) => [key, []])
  );

  for (const source of sources) {
    const sectionKey = PROVIDER_SECTION_MAP[source.providerType] ?? 'other';
    grouped.get(sectionKey)?.push(source);
  }

  return SOURCE_SECTION_ORDER
    .map((key) => ({ key, sources: grouped.get(key) ?? [] }))
    .filter((section) => section.sources.length > 0);
}

export default function Z0SourceManagerPage() {
  const [sources, setSources] = useState<SysDataSource[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await fetchSources();
    setSources(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 5000);
    return () => clearInterval(id);
  }, [refresh]);

  const runningCount = sources.filter((s) => s.runStatus === 'running').length;
  const errorCount = sources.filter((s) => s.runStatus === 'error').length;
  const cooldownCount = sources.filter((s) => s.runStatus === 'cooldown').length;
  const stoppedCount = sources.filter((s) => s.runStatus === 'stopped').length;

  const statusCounts: Array<{ status: RunStatus; count: number }> = [
    { status: 'running', count: runningCount },
    { status: 'error', count: errorCount },
    { status: 'cooldown', count: cooldownCount },
    { status: 'stopped', count: stoppedCount },
  ];
  const sections = buildSourceSections(sources);

  return (
    <div className="max-w-6xl space-y-5">
      <PageHeader
        title="Z0 수집 현황"
        description="도메인별 수집기 상태와 최근 수집 시점을 한눈에 확인합니다."
        zone="Z0"
        actions={
          <Link href="/z0/add" className="inline-flex items-center gap-2 rounded-lg bg-[#0984E3] px-3.5 py-2 text-[13px] font-medium text-white hover:bg-[#0773C5] transition-colors">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            소스 추가
          </Link>
        }
      />

      <div className="flex items-center gap-3 rounded-xl bg-white p-3.5 shadow-sm">
        {loading ? (
          <span className="text-[13px] text-[#636E72]">수집기 상태를 불러오는 중입니다...</span>
        ) : (
          <>
            <span className="text-[13px] font-medium text-[#636E72]">소스 {sources.length}개</span>
            <div className="h-4 w-px bg-[#E8ECEF]" />
            <div className="flex items-center gap-3 flex-wrap">
              {statusCounts.map(({ status, count }) => (
                <div key={status} className="flex items-center gap-1.5">
                  <StatusBadge status={status} size="sm" />
                  <span className="font-data text-[13px] font-semibold text-[#1A1D23]">{count}</span>
                </div>
              ))}
            </div>
          </>
        )}
        <div className="ml-auto">
          <Link href="/z0/explore" className="text-[13px] text-[#0984E3] hover:underline">
            원천 데이터 보기
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-[#E8ECEF] bg-white shadow-sm">
              <div className="h-14 animate-pulse border-b border-[#F1F5F9] bg-[#F8FAFC]" />
              <div className="space-y-3 p-4">
                {Array.from({ length: 3 }).map((__, rowIndex) => (
                  <div key={rowIndex} className="h-12 animate-pulse rounded-xl bg-[#F8FAFC]" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {sections.map((section) => (
            <SourceDomainSection
              key={section.key}
              sectionKey={section.key}
              sources={section.sources}
            />
          ))}
        </div>
      )}

      {!loading && sources.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-[#E8ECEF] p-8 text-center">
          <p className="text-[13px] text-[#636E72]">연결된 수집기가 아직 없습니다.</p>
        </div>
      )}
    </div>
  );
}
