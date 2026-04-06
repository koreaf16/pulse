/**
 * ============================================================================
 * @file        zone-status-row.tsx
 * @description Zone 운영 상태(소스 수, 행 수, 에러) 요약 카드 컴포넌트.
 * @zone        INFRA
 * @domain      System
 *
 * @dependencies @/components/ui/status-badge, @/lib/design-tokens, @/lib/utils
 * @called_by   app/page.tsx
 * @feeds_to    -
 *
 * @strict_rule 300라인 제한 준수.
 * ============================================================================
 */
import { StatusBadge } from '@/components/ui/status-badge';
import { ZONE_COLORS } from '@/lib/design-tokens';
import { formatCompact } from '@/lib/utils';
export interface ZoneStatus {
  zone: 'Z0' | 'Z1' | 'Z2';
  label: string;
  description: string;
  status: 'running' | 'error' | 'stopped' | 'cooldown';
  activeSourceCount: number;
  totalSourceCount: number;
  rowsToday: number;
  errorCount24h: number;
}

interface ZoneStatusRowProps {
  data: ZoneStatus;
}

export function ZoneStatusRow({ data }: ZoneStatusRowProps) {
  const colors = ZONE_COLORS[data.zone];

  return (
    <div
      className="flex items-center gap-6 rounded-xl bg-white p-5 shadow-sm border-l-4"
      style={{ borderLeftColor: colors.primary }}
    >
      {/* Zone label */}
      <div className="w-32 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold"
            style={{ backgroundColor: colors.light, color: colors.primary }}
          >
            {data.zone}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1A1D23]">{data.label}</p>
            <p className="text-[11px] text-[#636E72]">{data.description}</p>
          </div>
        </div>
      </div>

      {/* Status badge */}
      <div className="w-24 flex-shrink-0">
        <StatusBadge status={data.status} />
      </div>

      {/* Sources */}
      <div className="w-24 flex-shrink-0">
        <p className="text-[11px] text-[#636E72] uppercase tracking-wide">소스</p>
        <p className="font-data text-sm font-semibold text-[#1A1D23]">
          {data.activeSourceCount}
          <span className="text-[#B2BEC3]">/{data.totalSourceCount}</span>
        </p>
      </div>

      {/* Rows today */}
      <div className="w-28 flex-shrink-0">
        <p className="text-[11px] text-[#636E72] uppercase tracking-wide">오늘 행 수</p>
        <p className="font-data text-sm font-semibold text-[#1A1D23]">
          {formatCompact(data.rowsToday)}
        </p>
      </div>

      {/* Errors 24h */}
      <div className="w-20 flex-shrink-0">
        <p className="text-[11px] text-[#636E72] uppercase tracking-wide">오류 24h</p>
        <p
          className={`font-data text-sm font-semibold ${
            data.errorCount24h > 0 ? 'text-[#D63031]' : 'text-[#00B894]'
          }`}
        >
          {data.errorCount24h}
        </p>
      </div>

      {/* Progress bar */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] text-[#636E72]">활성 소스</span>
          <span className="font-data text-[11px] text-[#636E72]">
            {Math.round((data.activeSourceCount / data.totalSourceCount) * 100)}%
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-[#F5F6FA] overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${(data.activeSourceCount / data.totalSourceCount) * 100}%`,
              backgroundColor: colors.primary,
            }}
          />
        </div>
      </div>
    </div>
  );
}
