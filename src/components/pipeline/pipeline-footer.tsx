/**
 * ============================================================================
 * @file        pipeline-footer.tsx
 * @description 파이프라인 상태 footer — 실시간 메트릭 표시 컴포넌트.
 * @zone        INFRA
 * @domain      System
 *
 * [Architecture Context & Correlation]
 * @dependencies react
 * @called_by   components/pipeline/pipeline-live-view.tsx
 * @feeds_to    -
 *
 * @strict_rule
 *   1. 300라인 제한 준수.
 *   2. 시각화 전용 — 데이터 조회 금지.
 *   3. zoneMetrics props를 그대로 렌더링만 수행.
 * ============================================================================
 */

interface PipelineFooterProps {
  overallOk: boolean;
  z0AvgLatencyMs: number;
  z1AvgLatencyMs: number;
  llmStatus: string;
  dbStatus: string;
}

function statusColor(status: string): string {
  if (status === 'UP') return 'text-[#16A34A]';
  if (status === 'DOWN') return 'text-[#DC2626]';
  return 'text-[#D97706]';
}

function statusLabel(status: string): string {
  if (status === 'UP') return 'OK';
  if (status === 'DOWN') return 'DOWN';
  return status;
}

export function PipelineFooter({
  overallOk,
  z0AvgLatencyMs,
  z1AvgLatencyMs,
  llmStatus,
  dbStatus,
}: PipelineFooterProps) {
  return (
    <div className="z-20 flex flex-shrink-0 flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-[#E5E7EB] bg-white px-6 py-3 text-xs shadow-[0_-1px_2px_rgba(0,0,0,0.02)]">
      <div className={`flex items-center gap-2 rounded-md border px-3 py-1 ${overallOk ? 'border-[#BBF7D0] bg-[#F0FDF4]' : 'border-[#FCA5A5] bg-[#FEF2F2]'}`}>
        <span className={`h-2 w-2 rounded-full ${overallOk ? 'bg-green-500' : 'bg-red-500'}`} style={{ animation: 'blink 1.2s infinite' }} />
        <span className={`font-semibold tracking-wide ${overallOk ? 'text-green-700' : 'text-red-700'}`}>
          {overallOk ? 'All systems healthy' : 'System issue detected'}
        </span>
      </div>
      <span className="text-[#D1D5DB]">|</span>
      <div className="flex items-center gap-2">
        <span className="font-medium text-[#6B7280]">Z0 Avg Latency:</span>
        <span className="rounded bg-[#F3F4F6] px-2 py-0.5 font-data font-bold text-[#374151]">
          {z0AvgLatencyMs > 0 ? `${z0AvgLatencyMs}ms` : 'N/A'}
        </span>
      </div>
      <span className="text-[#D1D5DB]">|</span>
      <div className="flex items-center gap-2">
        <span className="font-medium text-[#6B7280]">Z1 Avg Latency:</span>
        <span className="rounded bg-[#F3F4F6] px-2 py-0.5 font-data font-bold text-[#374151]">
          {z1AvgLatencyMs > 0 ? `${z1AvgLatencyMs}ms` : 'N/A'}
        </span>
      </div>
      <span className="text-[#D1D5DB]">|</span>
      <div className="flex items-center gap-2">
        <span className="font-medium text-[#6B7280]">LLM Status:</span>
        <span className={`font-data font-bold ${statusColor(llmStatus)}`}>
          {statusLabel(llmStatus)}
        </span>
      </div>
      <span className="text-[#D1D5DB]">|</span>
      <div className="flex items-center gap-2">
        <span className="font-medium text-[#6B7280]">Oracle 26ai:</span>
        <span className={`font-data font-bold ${statusColor(dbStatus)}`}>
          {statusLabel(dbStatus)}
        </span>
      </div>
    </div>
  );
}
