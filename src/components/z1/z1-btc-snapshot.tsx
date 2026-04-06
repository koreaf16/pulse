'use client';

import type { Z1DashboardLevel, Z1DashboardRegime, Z1DashboardResponse, Z1DashboardTech } from '@/types/z1-dashboard';
import { timeAgo } from '@/lib/utils';

interface Props {
  symbol: string;
  btc: Z1DashboardResponse['btc'];
}

function signalPill(value: string | null | undefined): { bg: string; text: string } {
  if (!value) return { bg: '#F8FAFC', text: '#475569' };
  if (value.includes('UP') || value.includes('BULL') || value === 'RISK_ON') return { bg: '#ECFDF3', text: '#15803D' };
  if (value.includes('DOWN') || value.includes('BEAR') || value === 'RISK_OFF') return { bg: '#FEF2F2', text: '#B91C1C' };
  return { bg: '#F8FAFC', text: '#475569' };
}

function pct(value: number | null | undefined): string {
  if (value == null) return 'N/A';
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

function metric(value: number | null | undefined, digits = 2, suffix = ''): string {
  if (value == null) return 'N/A';
  return `${value.toFixed(digits)}${suffix}`;
}

function renderLevels(levels: Z1DashboardLevel[]): string[] {
  return levels
    .map((level) => level.price)
    .filter((price): price is number => typeof price === 'number')
    .slice(0, 3)
    .map((price) => price.toLocaleString('en-US', { maximumFractionDigits: 2 }));
}

function TimeframeCard({
  label,
  regime,
  tech,
}: {
  label: string;
  regime: Z1DashboardRegime | null;
  tech: Z1DashboardTech | null;
}) {
  if (!regime && !tech) {
    return (
      <div className="rounded-[22px] border border-dashed border-[#CBD5E1] bg-white/70 p-5">
        <p className="text-sm font-semibold text-[#0F172A]">{label}</p>
        <p className="mt-3 text-sm text-[#64748B]">No feature rows have landed yet for this timeframe.</p>
      </div>
    );
  }

  const regimeStyle = signalPill(regime?.REGIME);
  const supportLevels = renderLevels(regime?.SUPPORT_LEVELS ?? []);
  const resistanceLevels = renderLevels(regime?.RESISTANCE_LEVELS ?? []);
  const lastUpdated = tech?.CALCULATED_AT ?? regime?.CALCULATED_AT ?? tech?.CANDLE_TIME ?? regime?.CANDLE_TIME ?? null;

  return (
    <div className="rounded-[22px] border border-[#D9F99D] bg-white/85 p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#64748B]">{label}</p>
          <p className="mt-2 text-lg font-semibold text-[#0F172A]">{regime?.REGIME ?? 'Signal pending'}</p>
        </div>
        <span
          className="rounded-full px-3 py-1 text-xs font-semibold"
          style={{ backgroundColor: regimeStyle.bg, color: regimeStyle.text }}
        >
          {tech?.EMA_ALIGNMENT ?? regime?.TREND_DIRECTION ?? 'Waiting'}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {[
          ['Price move', pct(tech?.PRICE_CHANGE_PCT)],
          ['RSI', metric(tech?.RSI_14, 1)],
          ['MACD cross', tech?.MACD_CROSS ?? 'N/A'],
          ['ATR state', tech?.ATR_STATE ?? 'N/A'],
          ['Volume ratio', metric(tech?.VOLUME_RATIO, 2, 'x')],
          ['Regime score', metric(regime?.REGIME_SCORE, 2)],
        ].map(([labelText, value]) => (
          <div key={labelText} className="rounded-2xl bg-[#F8FAFC] px-4 py-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#64748B]">{labelText}</p>
            <p className="mt-2 text-sm font-semibold text-[#0F172A]">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-[#F8FAFC] px-4 py-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#64748B]">Support</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {supportLevels.length === 0 ? <span className="text-sm text-[#94A3B8]">No mapped levels</span> : supportLevels.map((level) => (
              <span key={level} className="rounded-full bg-white px-3 py-1 text-sm font-medium text-[#0F766E] shadow-sm">
                {level}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-[#F8FAFC] px-4 py-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#64748B]">Resistance</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {resistanceLevels.length === 0 ? <span className="text-sm text-[#94A3B8]">No mapped levels</span> : resistanceLevels.map((level) => (
              <span key={level} className="rounded-full bg-white px-3 py-1 text-sm font-medium text-[#9A3412] shadow-sm">
                {level}
              </span>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs text-[#64748B]">
        {lastUpdated ? `Last feature row ${timeAgo(lastUpdated)}` : 'Awaiting the first feature row'}
      </p>
    </div>
  );
}

export function Z1BtcSnapshot({ symbol, btc }: Props) {
  return (
    <section className="rounded-[30px] border border-[#BBF7D0] bg-[linear-gradient(135deg,#F7FEE7_0%,#ECFCCB_45%,#FFFFFF_100%)] p-6 shadow-[0_24px_60px_rgba(20,83,45,0.08)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4D7C0F]">BTC Feature Snapshot</p>
          <h2 className="mt-2 text-2xl font-semibold text-[#0F172A]">{symbol.replace('USDT', '')} market structure</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#475569]">
            The Z1 layer compresses raw candles, perp flow, and regime classification into a single market read.
          </p>
        </div>
        <div className="rounded-full border border-[#D9F99D] bg-white/80 px-3 py-1.5 text-xs font-medium text-[#3F6212]">
          1D for direction, 4H for timing
        </div>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <TimeframeCard label="Daily" regime={btc.regime1d} tech={btc.tech1d} />
        <TimeframeCard label="4 Hour" regime={btc.regime4h} tech={btc.tech4h} />
      </div>
    </section>
  );
}
