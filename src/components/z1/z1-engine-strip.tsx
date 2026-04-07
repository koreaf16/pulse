'use client';

import { timeAgo, translateSignalLabel } from '@/lib/utils';
import type { Z1DashboardModule } from '@/types/z1-dashboard';

interface Props {
  modules: Z1DashboardModule[];
}

const STATUS_STYLE: Record<Z1DashboardModule['status'], { bg: string; text: string }> = {
  UP: { bg: '#ECFDF3', text: '#15803D' },
  DOWN: { bg: '#FEF2F2', text: '#B91C1C' },
  DEGRADED: { bg: '#FFF7ED', text: '#C2410C' },
  UNKNOWN: { bg: '#F8FAFC', text: '#475569' },
};

function compact(value: number | null | undefined): string {
  if (value == null) return '없음';
  return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : `${value}`;
}

export function Z1EngineStrip({ modules }: Props) {
  return (
    <section className="rounded-[30px] border border-[#D1FAE5] bg-white/90 p-6 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.18em] text-[#64748B]">엔진 상태</p>
          <h3 className="mt-2 text-[18px] font-semibold text-[#0F172A]">피처 서비스 하트비트</h3>
        </div>
        <p className="text-[13px] text-[#64748B]">운영 정보는 유지하되, 화면에서 차지하는 비중은 줄였습니다.</p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {modules.map((module) => (
          <div key={module.componentId} className="rounded-[22px] border border-[#E2E8F0] bg-[linear-gradient(180deg,#FFFFFF_0%,#F8FAFC_100%)] px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[13px] font-semibold text-[#0F172A]">{module.label}</p>
                <p className="mt-1 text-[10px] tracking-[0.12em] text-[#94A3B8]">{module.componentId}</p>
              </div>
              <span className="rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ backgroundColor: STATUS_STYLE[module.status].bg, color: STATUS_STYLE[module.status].text }}>
                {translateSignalLabel(module.status === 'DEGRADED' ? 'DEGRADED' : module.status)}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                ['누적', compact(module.rowsProcessed)],
                ['1분', module.recentRows != null ? `+${compact(module.recentRows)}` : '없음'],
                ['지연', module.avgLatencyMs != null ? `${module.avgLatencyMs.toFixed(0)}ms` : '없음'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-white px-3 py-2 shadow-sm">
                  <p className="text-[10px] font-medium tracking-[0.12em] text-[#94A3B8]">{label}</p>
                  <p className="mt-1 text-xs font-semibold text-[#0F172A]">{value}</p>
                </div>
              ))}
            </div>

            <p className="mt-4 text-[11px] text-[#64748B]">
              {module.lastHeartbeat ? `최근 비트 ${timeAgo(module.lastHeartbeat)}` : '하트비트 없음'}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
