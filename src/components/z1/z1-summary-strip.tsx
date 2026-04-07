'use client';

import { timeAgo, toETString, translateSignalLabel } from '@/lib/utils';
import type { Z1DashboardMacro, Z1DashboardResponse } from '@/types/z1-dashboard';

interface Props {
  meta: Z1DashboardResponse['meta'];
  btc: Z1DashboardResponse['btc'];
  macro: Z1DashboardMacro | null;
  refreshing: boolean;
}

const TONE_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  LIVE: { bg: '#ECFDF3', border: '#A7F3D0', text: '#047857' },
  PARTIAL: { bg: '#FFF7ED', border: '#FED7AA', text: '#C2410C' },
  OFFLINE: { bg: '#FEF2F2', border: '#FECACA', text: '#B91C1C' },
  STRONG_UPTREND: { bg: '#ECFDF3', border: '#A7F3D0', text: '#047857' },
  UPTREND: { bg: '#ECFDF3', border: '#BBF7D0', text: '#15803D' },
  RANGE_BOUND: { bg: '#F8FAFC', border: '#CBD5E1', text: '#475569' },
  DOWNTREND: { bg: '#FEF2F2', border: '#FECACA', text: '#B91C1C' },
  STRONG_DOWNTREND: { bg: '#FEE2E2', border: '#FCA5A5', text: '#991B1B' },
  RISK_ON: { bg: '#ECFDF3', border: '#BBF7D0', text: '#15803D' },
  NEUTRAL: { bg: '#F8FAFC', border: '#CBD5E1', text: '#475569' },
  RISK_OFF: { bg: '#FEF2F2', border: '#FECACA', text: '#B91C1C' },
  BULLISH: { bg: '#ECFDF3', border: '#BBF7D0', text: '#15803D' },
  BEARISH: { bg: '#FEF2F2', border: '#FECACA', text: '#B91C1C' },
  STRONG_LONG: { bg: '#ECFDF3', border: '#BBF7D0', text: '#15803D' },
  LONG: { bg: '#ECFDF3', border: '#BBF7D0', text: '#15803D' },
  SHORT: { bg: '#FEF2F2', border: '#FECACA', text: '#B91C1C' },
  STRONG_SHORT: { bg: '#FEE2E2', border: '#FCA5A5', text: '#991B1B' },
};

function toneFor(value: string | null | undefined) {
  return TONE_STYLES[value ?? ''] ?? { bg: '#F8FAFC', border: '#E2E8F0', text: '#475569' };
}

function signedPercent(value: number | null | undefined): string {
  if (value == null) return '없음';
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

function SummaryCard({
  eyebrow,
  title,
  detail,
  accent,
}: {
  eyebrow: string;
  title: string;
  detail: string;
  accent: { bg: string; border: string; text: string };
}) {
  return (
    <div className="rounded-[24px] border px-4 py-4 shadow-sm" style={{ backgroundColor: accent.bg, borderColor: accent.border }}>
      <p className="text-[10px] font-semibold tracking-[0.14em] text-[#64748B]">{eyebrow}</p>
      <p className="mt-2.5 text-[17px] font-semibold leading-tight" style={{ color: accent.text }}>
        {title}
      </p>
      <p className="mt-1.5 text-[13px] leading-5 text-[#475569]">{detail}</p>
    </div>
  );
}

export function Z1SummaryStrip({ meta, btc, macro, refreshing }: Props) {
  const syncLabel = meta.asOf ? `${timeAgo(meta.asOf)} · ${toETString(meta.asOf)}` : '첫 스냅샷 대기 중';

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.18em] text-[#64748B]">신호 요약</p>
          <p className="mt-1 text-[13px] text-[#475569]">
            {meta.symbol.replace('USDT', '')} 기준 최신 Z1 신호를 빠르게 읽을 수 있게 정리했습니다.
          </p>
        </div>
        <div className="rounded-full border border-[#D1FAE5] bg-white/80 px-3 py-1.5 text-[11px] text-[#047857] shadow-sm backdrop-blur">
          {refreshing ? '스냅샷 새로 고침 중' : `최근 동기화 ${syncLabel}`}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          eyebrow="파이프라인"
          title={translateSignalLabel(meta.zoneStatus)}
          detail={`${meta.activeModules}/${meta.totalModules}개 피처 모듈 가동 중`}
          accent={toneFor(meta.zoneStatus)}
        />
        <SummaryCard
          eyebrow="BTC 1일"
          title={translateSignalLabel(btc.regime1d?.REGIME ?? 'PENDING')}
          detail={`점수 ${btc.regime1d?.REGIME_SCORE?.toFixed(2) ?? '없음'} · RSI ${translateSignalLabel(btc.tech1d?.RSI_STATE)}`}
          accent={toneFor(btc.regime1d?.REGIME)}
        />
        <SummaryCard
          eyebrow="거시"
          title={translateSignalLabel(macro?.MACRO_REGIME ?? 'PENDING')}
          detail={`DXY ${translateSignalLabel(macro?.DXY_STATE)} · VIX ${translateSignalLabel(macro?.VIX_STATE)}`}
          accent={toneFor(macro?.MACRO_REGIME)}
        />
        <SummaryCard
          eyebrow="선물 수급"
          title={translateSignalLabel(btc.perp?.SUPPLY_PRESSURE ?? 'PENDING')}
          detail={`펀딩 ${translateSignalLabel(btc.perp?.FUNDING_STATE)} · OI ${signedPercent(btc.perp?.OI_CHANGE_1D)}`}
          accent={toneFor(btc.perp?.SUPPLY_PRESSURE)}
        />
      </div>
    </section>
  );
}
