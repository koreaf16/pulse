'use client';

import { startTransition, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { fetchZ1Dashboard } from '@/lib/api';
import type { Z1DashboardResponse } from '@/types/z1-dashboard';
import { Z1BtcSnapshot } from './z1-btc-snapshot';
import { Z1EngineStrip } from './z1-engine-strip';
import { Z1PreviewGrid } from './z1-preview-grid';
import { Z1SidePanels } from './z1-side-panels';
import { Z1SummaryStrip } from './z1-summary-strip';

const DASHBOARD_SYMBOL = 'BTCUSDT';

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-[24px] bg-white shadow-sm" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.95fr)]">
        <div className="h-[520px] animate-pulse rounded-[30px] bg-white shadow-sm" />
        <div className="space-y-5">
          <div className="h-[270px] animate-pulse rounded-[28px] bg-white shadow-sm" />
          <div className="h-[360px] animate-pulse rounded-[28px] bg-white shadow-sm" />
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div className="h-[420px] animate-pulse rounded-[28px] bg-white shadow-sm" />
        <div className="h-[420px] animate-pulse rounded-[28px] bg-white shadow-sm" />
      </div>
    </div>
  );
}

export function Z1DashboardPage() {
  const dashboardRef = useRef<Z1DashboardResponse | null>(null);
  const [dashboard, setDashboard] = useState<Z1DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let disposed = false;

    const load = async (initial = false) => {
      if (initial) setLoading(true);
      else setRefreshing(true);

      const next = await fetchZ1Dashboard(DASHBOARD_SYMBOL);
      if (disposed) return;

      startTransition(() => {
        if (next) {
          dashboardRef.current = next;
          setDashboard(next);
          setError(null);
        } else if (!dashboardRef.current) {
          setError('Z1 대시보드를 불러오지 못했습니다.');
        } else {
          setError('새로고침에 실패해 마지막 정상 스냅샷을 표시합니다.');
        }
      });

      setLoading(false);
      setRefreshing(false);
    };

    void load(true);
    const id = setInterval(() => void load(false), 30_000);
    return () => {
      disposed = true;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="relative mx-auto max-w-7xl space-y-5 pb-12">
      <div className="pointer-events-none absolute inset-x-0 top-8 -z-10 h-[360px] rounded-[40px] bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.14),_transparent_55%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.10),_transparent_50%),linear-gradient(180deg,_rgba(255,255,255,0.95)_0%,_rgba(248,250,252,0)_100%)]" />

      <PageHeader
        title="Z1 피처 신호"
        description="BTC 기준으로 파생 지표, 거시 환경, 선물 수급, 뉴스 흐름을 요약합니다."
        zone="Z1"
        actions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            {error && <span className="rounded-full bg-[#FEF2F2] px-3 py-1 text-xs text-[#B91C1C]">{error}</span>}
            <span className="rounded-full border border-[#D1FAE5] bg-white px-3 py-1 text-xs text-[#047857]">
              {refreshing ? '새로고침 중' : '30초마다 갱신'}
            </span>
            <Link href="/z1/explore" className="inline-flex items-center gap-2 rounded-lg bg-[#16A34A] px-3.5 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[#15803D]">
              세부 데이터 보기
            </Link>
          </div>
        }
      />

      {loading ? (
        <DashboardSkeleton />
      ) : dashboard ? (
        <>
          <Z1SummaryStrip meta={dashboard.meta} btc={dashboard.btc} macro={dashboard.macro} refreshing={refreshing} />
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.95fr)]">
            <Z1BtcSnapshot symbol={dashboard.meta.symbol} btc={dashboard.btc} />
            <Z1SidePanels perp={dashboard.btc.perp} macro={dashboard.macro} />
          </div>
          <Z1PreviewGrid news={dashboard.news} correlation={dashboard.correlation} />
          <Z1EngineStrip modules={dashboard.modules} />
        </>
      ) : (
        <div className="rounded-[28px] border-2 border-dashed border-[#CBD5E1] bg-white/80 px-6 py-16 text-center shadow-sm">
          <p className="text-base font-semibold text-[#0F172A]">Z1 피처 결과를 기다리는 중입니다.</p>
          <p className="mt-2 text-[13px] text-[#64748B]">
            피처 파이프라인이 첫 스냅샷을 기록하면 이 화면에 BTC 신호 요약이 표시됩니다.
          </p>
        </div>
      )}
    </div>
  );
}
