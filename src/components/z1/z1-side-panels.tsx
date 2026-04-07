'use client';

import { toETString, translateSignalLabel } from '@/lib/utils';
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
  if (value == null) return '없음';
  return `${value >= 0 ? '+' : ''}${value.toFixed(digits)}${suffix}`;
}

function fundingRate(value: number | null | undefined): string {
  if (value == null) return '없음';
  return `${(value * 100).toFixed(3)}%`;
}

function block(title: string, rows: Array<[string, string]>) {
  return (
    <div className="space-y-3 rounded-[24px] border border-[#E2E8F0] bg-white/90 p-5 shadow-sm">
      <p className="text-[10px] font-semibold tracking-[0.16em] text-[#64748B]">{title}</p>
      <div className="space-y-2.5">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4 rounded-2xl bg-[#F8FAFC] px-4 py-3">
            <span className="text-[13px] text-[#64748B]">{label}</span>
            <span className="text-[13px] font-semibold text-[#0F172A]">{value}</span>
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
            <p className="text-[10px] font-semibold tracking-[0.16em] text-[#64748B]">선물 포지셔닝</p>
            <h3 className="mt-2 text-[18px] font-semibold text-[#0F172A]">
              {translateSignalLabel(perp?.SUPPLY_PRESSURE ?? 'PENDING')}
            </h3>
          </div>
          <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: perpStyle.bg, color: perpStyle.text }}>
            {translateSignalLabel(perp?.FUNDING_STATE)}
          </span>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {[
            ['펀딩 비율', fundingRate(perp?.FUNDING_RATE)],
            ['8시간 평균', fundingRate(perp?.FUNDING_8H_AVG)],
            ['OI 1일 변화', signed(perp?.OI_CHANGE_1D, 2, '%')],
            ['OI 괴리', translateSignalLabel(perp?.OI_PRICE_DIVERGENCE)],
            ['롱숏 괴리', translateSignalLabel(perp?.LS_DIVERGENCE)],
            ['청산 불균형', signed(perp?.LIQUIDATION_IMBALANCE, 2)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-white/90 px-4 py-3">
              <p className="text-[10px] font-medium tracking-[0.12em] text-[#64748B]">{label}</p>
              <p className="mt-1.5 text-[13px] font-semibold text-[#0F172A]">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[28px] border border-[#DDD6FE] bg-[linear-gradient(180deg,#F5F3FF_0%,#FFFFFF_100%)] p-6 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.16em] text-[#64748B]">거시 배경</p>
            <h3 className="mt-2 text-[18px] font-semibold text-[#0F172A]">
              {translateSignalLabel(macro?.MACRO_REGIME ?? 'PENDING')}
            </h3>
          </div>
          <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: macroStyle.bg, color: macroStyle.text }}>
            {translateSignalLabel(macro?.LIQUIDITY_STATE)}
          </span>
        </div>

        <div className="mt-5 grid gap-4">
          {block('핵심 상태', [
            ['수익률 곡선', translateSignalLabel(macro?.YIELD_CURVE_STATE)],
            ['DXY', macro?.DXY_VALUE != null ? `${macro.DXY_VALUE.toFixed(2)} · ${translateSignalLabel(macro.DXY_STATE)}` : '없음'],
            ['VIX', macro?.VIX_VALUE != null ? `${macro.VIX_VALUE.toFixed(2)} · ${translateSignalLabel(macro.VIX_STATE)}` : '없음'],
            ['BTC 도미넌스', macro?.BTC_DOMINANCE != null ? `${macro.BTC_DOMINANCE.toFixed(2)}%` : '없음'],
          ])}
          {block('이벤트 일정', [
            ['최근 이벤트', macro?.LATEST_EVENT_NAME ?? '기록 없음'],
            ['다음 이벤트', macro?.NEXT_EVENT_NAME ?? '예정 없음'],
            ['다음 시각', macro?.NEXT_EVENT_DATE ? toETString(macro.NEXT_EVENT_DATE) : '없음'],
            ['남은 일수', macro?.DAYS_TO_NEXT_EVENT != null ? `${macro.DAYS_TO_NEXT_EVENT}일` : '없음'],
          ])}
        </div>
      </div>
    </section>
  );
}
