import type { HealthSummary, SysHeartbeat } from '@/types/system';
import { HEALTH_STYLES } from '@/lib/design-tokens';

function timeAgo(iso: string): string {
  const sec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (sec < 60) return `${sec}s ago`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  return `${Math.floor(sec / 3600)}h ago`;
}

function StatusDot({ status }: { status: SysHeartbeat['status'] }) {
  const style = HEALTH_STYLES[status];
  return (
    <span className="flex items-center gap-1.5">
      <span className={`inline-block w-2 h-2 rounded-full ${style.dot}`} />
      <span className={`text-xs font-medium ${style.text}`}>{style.label}</span>
    </span>
  );
}

function ComponentCard({ hb }: { hb: SysHeartbeat }) {
  const style = HEALTH_STYLES[hb.status];
  return (
    <div className={`rounded-lg border p-3 ${style.badge}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-800 truncate">{hb.componentId}</span>
        <StatusDot status={hb.status} />
      </div>
      <div className="text-xs text-gray-500 space-y-0.5">
        <div>Last heartbeat: {timeAgo(hb.lastHeartbeat)}</div>
        {hb.metrics.rowsProcessed !== undefined && <div>Rows processed: {hb.metrics.rowsProcessed.toLocaleString()}</div>}
        {hb.metrics.avgLatencyMs !== undefined && <div>Avg latency: {hb.metrics.avgLatencyMs}ms</div>}
        {hb.metrics.errorsLast1h !== undefined && hb.metrics.errorsLast1h > 0 && (
          <div className="text-red-500">1h errors: {hb.metrics.errorsLast1h}</div>
        )}
      </div>
    </div>
  );
}

function SummaryBar({ summary }: { summary: HealthSummary }) {
  return (
    <div className="flex items-center gap-4 mb-4 p-3 rounded-lg bg-gray-50 border">
      <span className="text-sm font-semibold text-gray-700">Pipeline Health</span>
      <StatusDot status={summary.overallStatus} />
      <span className="text-xs text-gray-500">
        UP {summary.totalUp} / DOWN {summary.totalDown} / DEGRADED {summary.totalDegraded} / UNKNOWN {summary.totalUnknown}
      </span>
    </div>
  );
}

interface HealthPanelProps {
  summary: HealthSummary;
}

export default function HealthPanel({ summary }: HealthPanelProps) {
  const collectors = summary.components.filter((c) => c.componentType === 'collector');
  const infra = summary.components.filter((c) => c.componentType === 'infrastructure');

  return (
    <section>
      <SummaryBar summary={summary} />

      {infra.length > 0 && (
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Infrastructure</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {infra.map((hb) => <ComponentCard key={hb.componentId} hb={hb} />)}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Collectors</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {collectors.map((hb) => <ComponentCard key={hb.componentId} hb={hb} />)}
        </div>
      </div>
    </section>
  );
}
