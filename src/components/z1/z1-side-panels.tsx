'use client';

import { toETString } from '@/lib/utils';
import type { Z1DashboardMacro, Z1DashboardPerp } from '@/types/z1-dashboard';

interface Props {
  perp: Z1DashboardPerp | null;
  macro: Z1DashboardMacro | null;
}

function stateStyle(value: string | null | undefined): { bg: string; text: string } {
  if (!value) return { bg: '#F8FAFC', text: '#475569' };
  if (value.includes('LONG') || value.includes('BULL') || value.includes('RISK_ON') || value.includes('INFLOW')) {
    return { bg: '#ECFDF3', text: '#15803D' };
  }
  if (value.includes('SHORT') || value.includes('BEAR') || value.includes('RISK_OFF') || value.includes('OUTFLOW')) {
    return { bg: '#FEF2F2', text: '#B91C1C' };
  }
  return { bg: '#F8FAFC', text: '#475569' };
}

function signed(value: number | null | undefined, digits = 2, suffix = ''): string {
  if (value == null) return 'N/A';
  return `${value >= 0 ? '+' : ''}${value.toFixed(digits)}${suffix}`;
}

function fundingRate(value: number | null | undefined): string {
  if (value == null) return 'N/A';
  return `${(value * 100).toFixed(3)}%`;
}

function block(title: string, rows: Array<[string, string]>) {
  return (
    <div className="space-y-3 rounded-[24px] border border-[#E2E8F0] bg-white/90 p-5 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#64748B]">{title}</p>
      <div className="space-y-2.5">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4 rounded-2xl bg-[#F8FAFC] px-4 py-3">
            <span className="text-sm text-[#64748B]">{label}</span>
            <span className="text-sm font-semibold text-[#0F172A]">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Z1SidePanels({ perp, macro }: Props) {
  const perpStyle = stateStyle(perp?.SUPPLY_PRESSURE);
  const macroStyle = stateStyle(macro?.MACRO_REGIME);

  return (
    <section className="grid gap-5">
      <div className="rounded-[28px] border border-[#BFDBFE] bg-[linear-gradient(180deg,#EFF6FF_0%,#FFFFFF_100%)] p-6 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#64748B]">Perp Positioning</p>
            <h3 className="mt-2 text-xl font-semibold text-[#0F172A]">{perp?.SUPPLY_PRESSURE ?? 'Awaiting data'}</h3>
          </div>
          <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: perpStyle.bg, color: perpStyle.text }}>
            {perp?.FUNDING_STATE ?? 'No flow state'}
          </span>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {[
            ['Funding rate', fundingRate(perp?.FUNDING_RATE)],
            ['Funding 8h avg', fundingRate(perp?.FUNDING_8H_AVG)],
            ['OI change 1d', signed(perp?.OI_CHANGE_1D, 2, '%')],
            ['OI divergence', perp?.OI_PRICE_DIVERGENCE ?? 'N/A'],
            ['L/S divergence', perp?.LS_DIVERGENCE ?? 'N/A'],
            ['Liq imbalance', signed(perp?.LIQUIDATION_IMBALANCE, 2)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-white/90 px-4 py-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#64748B]">{label}</p>
              <p className="mt-2 text-sm font-semibold text-[#0F172A]">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[28px] border border-[#DDD6FE] bg-[linear-gradient(180deg,#F5F3FF_0%,#FFFFFF_100%)] p-6 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#64748B]">Macro Backdrop</p>
            <h3 className="mt-2 text-xl font-semibold text-[#0F172A]">{macro?.MACRO_REGIME ?? 'Awaiting data'}</h3>
          </div>
          <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: macroStyle.bg, color: macroStyle.text }}>
            {macro?.LIQUIDITY_STATE ?? 'No macro state'}
          </span>
        </div>

        <div className="mt-5 grid gap-4">
          {block('Core states', [
            ['Yield curve', macro?.YIELD_CURVE_STATE ?? 'N/A'],
            ['DXY', macro?.DXY_VALUE != null ? `${macro.DXY_VALUE.toFixed(2)} • ${macro.DXY_STATE}` : 'N/A'],
            ['VIX', macro?.VIX_VALUE != null ? `${macro.VIX_VALUE.toFixed(2)} • ${macro.VIX_STATE}` : 'N/A'],
            ['BTC dominance', macro?.BTC_DOMINANCE != null ? `${macro.BTC_DOMINANCE.toFixed(2)}%` : 'N/A'],
          ])}
          {block('Event window', [
            ['Latest event', macro?.LATEST_EVENT_NAME ?? 'No event logged'],
            ['Next event', macro?.NEXT_EVENT_NAME ?? 'No upcoming event'],
            ['Next date', macro?.NEXT_EVENT_DATE ? toETString(macro.NEXT_EVENT_DATE) : 'N/A'],
            ['Days to next', macro?.DAYS_TO_NEXT_EVENT != null ? String(macro.DAYS_TO_NEXT_EVENT) : 'N/A'],
          ])}
        </div>
      </div>
    </section>
  );
}
