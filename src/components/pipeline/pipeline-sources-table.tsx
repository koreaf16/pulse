'use client';

import { useEffect, useState } from 'react';
import { fetchSources } from '@/lib/api';
import type { SysDataSource } from '@/types/system';
import { timeAgo } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/status-badge';

export function PipelineSourcesTable() {
  const [sources, setSources] = useState<SysDataSource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await fetchSources();
      setSources(data);
      setLoading(false);
    }

    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, []);

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center rounded-2xl bg-white/40 border border-[#E5E7EB]">
        <span className="text-sm font-medium text-[#636E72]">Loading source status...</span>
      </div>
    );
  }

  return (
    <div className="w-full bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-[#E5E7EB] relative">
      <div className="absolute -top-3 left-6 px-3 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-full tracking-wider border border-indigo-200">
        Z0 SOURCES DETAIL
      </div>

      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-[#1A1D23]">Z0 ingestion sources</h3>
          <p className="text-[11px] text-[#636E72] mt-0.5">Live status and row counts for currently tracked collectors.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-[#636E72] uppercase tracking-wide">Active Sources</span>
          <span className="font-data text-lg font-bold text-indigo-600">
            {sources.filter((s) => s.runStatus === 'running').length} / {sources.length}
          </span>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[#636E72]">
            <tr>
              <th className="px-4 py-3 font-semibold uppercase tracking-wider w-[180px]">Source ID</th>
              <th className="px-4 py-3 font-semibold uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 font-semibold uppercase tracking-wider text-right">Total Rows</th>
              <th className="px-4 py-3 font-semibold uppercase tracking-wider text-right">Recent (1m)</th>
              <th className="px-4 py-3 font-semibold uppercase tracking-wider text-right">Avg Latency</th>
              <th className="px-4 py-3 font-semibold uppercase tracking-wider text-right">Last Beat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F3F4F6]">
            {sources.map((src) => {
              const totalRows = src.config?.totalRows as number | undefined;
              const recentRows = src.config?.recentRows as number | undefined;
              const avgLatencyMs = src.config?.avgLatencyMs as number | undefined;

              return (
                <tr key={src.sourceId} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="px-4 py-3 font-medium text-[#1A1D23] truncate" title={src.sourceName}>
                    {src.sourceName}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={src.runStatus} size="sm" />
                  </td>
                  <td className="px-4 py-3 text-right font-data text-[#374151]">{(totalRows ?? 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-data">
                    {recentRows != null && recentRows > 0 ? (
                      <span className="text-emerald-600 font-bold">+{recentRows.toLocaleString()}</span>
                    ) : (
                      <span className="text-[#9BA3AF]">0</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-data text-[#374151]">
                    {avgLatencyMs != null ? `${avgLatencyMs.toFixed(0)} ms` : 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-right font-data text-[#6B7280]">
                    {src.updatedAt ? timeAgo(src.updatedAt) : 'N/A'}
                  </td>
                </tr>
              );
            })}
            {sources.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#636E72]">
                  No sources are registered yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
