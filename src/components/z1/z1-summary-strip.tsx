'use client';

import { timeAgo, toETString } from '@/lib/utils';
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
};

function toneFor(value: string | null | undefined) {
  return TONE_STYLES[value ?? ''] ?? { bg: '#F8FAFC', border: '#E2E8F0', text: '#475569' };
}

function signedPercent(value: number | null | undefined): string {
  if (value == null) return 'N/A';
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
    <div
      className="rounded-[24px] border px-5 py-4 shadow-sm"
      style={{ backgroundColor: accent.bg, borderColor: accent.border }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">{eyebrow}</p>
      <p className="mt-3 text-[20px] font-semibold leading-tight" style={{ color: accent.text }}>
        {title}
      </p>
      <p className="mt-2 text-sm text-[#475569]">{detail}</p>
    </div>
  );
}

export function Z1SummaryStrip({ meta, btc, macro, refreshing }: Props) {
  const syncLabel = meta.asOf ? `${timeAgo(meta.asOf)} • ${toETString(meta.asOf)}` : 'Waiting for first snapshot';

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#64748B]">Signal Board</p>
          <p className="mt-1 text-sm text-[#475569]">
            Latest Z1-derived signal stack for {meta.symbol.replace('USDT', '')}.
          </p>
        </div>
        <div className="rounded-full border border-[#D1FAE5] bg-white/80 px-3 py-1.5 text-xs text-[#047857] shadow-sm backdrop-blur">
          {refreshing ? 'Refreshing snapshot...' : `Last sync ${syncLabel}`}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          eyebrow="Pipeline"
          title={meta.zoneStatus}
          detail={`${meta.activeModules}/${meta.totalModules} feature modules online`}
          accent={toneFor(meta.zoneStatus)}
        />
        <SummaryCard
          eyebrow="BTC 1D"
          title={btc.regime1d?.REGIME ?? 'Pending'}
          detail={`Score ${btc.regime1d?.REGIME_SCORE?.toFixed(2) ?? 'N/A'} • RSI ${btc.tech1d?.RSI_STATE ?? 'N/A'}`}
          accent={toneFor(btc.regime1d?.REGIME)}
        />
        <SummaryCard
          eyebrow="Macro"
          title={macro?.MACRO_REGIME ?? 'Pending'}
          detail={`DXY ${macro?.DXY_STATE ?? 'N/A'} • VIX ${macro?.VIX_STATE ?? 'N/A'}`}
          accent={toneFor(macro?.MACRO_REGIME)}
        />
        <SummaryCard
          eyebrow="Perp"
          title={btc.perp?.SUPPLY_PRESSURE ?? 'Pending'}
          detail={`Funding ${btc.perp?.FUNDING_STATE ?? 'N/A'} • OI ${signedPercent(btc.perp?.OI_CHANGE_1D)}`}
          accent={toneFor(btc.perp?.SUPPLY_PRESSURE)}
        />
      </div>
    </section>
  );
}
