'use client';

import React, { useEffect, useState } from 'react';
import { fetchTablePartitions, fetchTableSizes } from '@/lib/api';

function formatBytes(bytes: number): string {
  if (!bytes) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`;
}

interface TableSizeRow {
  TABLE_NAME: string;
  PARTITION_COUNT: number;
  TOTAL_BYTES: number;
}

interface PartitionRow {
  PARTITION_NAME: string;
  NUM_ROWS: number;
  SIZE_MB: number;
  HIGH_VALUE: string;
}

export function PipelineStorageStatus() {
  const [data, setData] = useState<TableSizeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Record<string, PartitionRow[]>>({});
  const [loadingPartitions, setLoadingPartitions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function load() {
      const rows = await fetchTableSizes();
      setData(rows as TableSizeRow[]);
      setLoading(false);
    }

    load();
    const id = setInterval(load, 60000);
    return () => clearInterval(id);
  }, []);

  const toggleRow = async (tableName: string) => {
    if (expandedRows[tableName]) {
      setExpandedRows((prev) => {
        const next = { ...prev };
        delete next[tableName];
        return next;
      });
      return;
    }

    setLoadingPartitions((prev) => ({ ...prev, [tableName]: true }));
    try {
      const parts = await fetchTablePartitions(tableName);
      setExpandedRows((prev) => ({ ...prev, [tableName]: parts as PartitionRow[] }));
    } catch (err) {
      console.error(err);
      setExpandedRows((prev) => ({ ...prev, [tableName]: [] }));
    } finally {
      setLoadingPartitions((prev) => ({ ...prev, [tableName]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center rounded-2xl bg-white/40 border border-[#E5E7EB]">
        <span className="text-sm font-medium text-[#636E72]">Loading storage status...</span>
      </div>
    );
  }

  const totalBytes = data.reduce((acc, row) => acc + (row.TOTAL_BYTES || 0), 0);

  return (
    <div className="w-full bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-[#E5E7EB] relative">
      <div className="absolute -top-3 left-6 px-3 py-1 bg-teal-100 text-teal-700 text-[10px] font-bold rounded-full tracking-wider border border-teal-200">
        Z0 STORAGE STATUS
      </div>

      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-[#1A1D23]">Z0 raw table storage</h3>
          <p className="text-[11px] text-[#636E72] mt-0.5">Partition counts and footprint for raw ingestion tables.</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold text-[#636E72] uppercase tracking-wide">Total Z0 Size</span>
          <span className="font-data text-lg font-bold text-teal-600">{formatBytes(totalBytes)}</span>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[#636E72]">
            <tr>
              <th className="px-4 py-3 font-semibold uppercase tracking-wider w-8" />
              <th className="px-4 py-3 font-semibold uppercase tracking-wider">Table Name</th>
              <th className="px-4 py-3 font-semibold uppercase tracking-wider text-right">Partitions</th>
              <th className="px-4 py-3 font-semibold uppercase tracking-wider text-right">Size</th>
              <th className="px-4 py-3 font-semibold uppercase tracking-wider">Usage Bar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F3F4F6]">
            {data.map((row) => {
              const pct = totalBytes > 0 ? (row.TOTAL_BYTES / totalBytes) * 100 : 0;
              const isExpanded = !!expandedRows[row.TABLE_NAME];
              const isLoadingParts = !!loadingPartitions[row.TABLE_NAME];
              const partitions = expandedRows[row.TABLE_NAME] ?? [];

              return (
                <React.Fragment key={row.TABLE_NAME}>
                  <tr
                    className={`transition-colors cursor-pointer ${isExpanded ? 'bg-[#F0FDF4]' : 'hover:bg-[#F9FAFB]'}`}
                    onClick={() => toggleRow(row.TABLE_NAME)}
                  >
                    <td className="px-4 py-3 text-[#B2BEC3] text-center">
                      <svg className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </td>
                    <td className="px-4 py-3 font-bold text-[#1A1D23]">{row.TABLE_NAME}</td>
                    <td className="px-4 py-3 text-right font-data text-[#636E72]">
                      <span className="inline-block bg-[#F3F4F6] px-2 py-0.5 rounded text-[10px] font-bold text-[#374151]">
                        {row.PARTITION_COUNT}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-data font-bold text-[#0F766E]">{formatBytes(row.TOTAL_BYTES)}</td>
                    <td className="px-4 py-3 w-1/3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                          <div className="h-full bg-teal-500 rounded-full" style={{ width: `${Math.max(pct, 1)}%` }} />
                        </div>
                        <span className="font-data text-[10px] text-[#636E72] w-8 text-right">{pct.toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr key={`${row.TABLE_NAME}-expanded`} className="bg-[#F8FAFC]">
                      <td colSpan={5} className="p-0 border-t border-[#E5E7EB]">
                        <div className="px-12 py-4 shadow-inner">
                          {isLoadingParts ? (
                            <div className="text-[11px] text-[#6B7280] py-4 flex items-center justify-center gap-2">
                              <div className="w-4 h-4 border-2 border-teal-200 border-t-teal-500 rounded-full animate-spin" />
                              Loading partition details...
                            </div>
                          ) : partitions.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {partitions.map((p) => (
                                <div key={p.PARTITION_NAME} className="flex flex-col p-3 bg-white rounded-xl border border-[#E5E7EB] shadow-sm hover:border-teal-300 hover:shadow-md transition-all group">
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                      <div className={`w-2 h-2 rounded-full ${Number(p.NUM_ROWS) > 0 ? 'bg-teal-400' : 'bg-gray-300'} group-hover:scale-125 transition-transform`} />
                                      <span className="font-mono text-[10px] font-bold text-[#4B5563] truncate">{p.PARTITION_NAME}</span>
                                    </div>
                                    <span className="font-data text-[11px] font-bold text-[#0F766E]">{(p.SIZE_MB || 0).toFixed(2)} MB</span>
                                  </div>
                                  <div className="mb-2">
                                    <span className="text-[9px] font-mono text-[#9BA3AF] break-all leading-tight block bg-gray-50 p-1 rounded border border-gray-100">
                                      {p.HIGH_VALUE || 'Initial partition'}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between mt-auto">
                                    <div className="flex flex-col">
                                      <span className="text-[9px] text-[#9BA3AF] uppercase font-bold tracking-tighter">Rows</span>
                                      <span className="font-data text-[12px] font-semibold text-[#1A1D23]">{Number(p.NUM_ROWS).toLocaleString()}</span>
                                    </div>
                                    <div className="flex-1 max-w-[60px] h-1 bg-gray-100 rounded-full overflow-hidden ml-3">
                                      <div className={`h-full ${Number(p.NUM_ROWS) > 0 ? 'bg-teal-500' : 'bg-gray-200'} rounded-full`} style={{ width: `${Math.min((Number(p.NUM_ROWS) / 100000) * 100, 100)}%` }} />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-[11px] text-[#9BA3AF] py-6 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
                              No partition details are available for this table.
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
