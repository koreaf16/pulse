'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { DataTable, type ColumnDef } from '@/components/ui/data-table';
import { fetchZ1TableData } from '@/lib/api';
import {
  Z1_TABLE_GROUPS,
  Z1_COLUMN_HEADER_MAP,
  Z1_ENUM_VALUE_MAP,
} from './z1-column-config';

const DATE_COLUMN_KEYS = new Set([
  'CANDLE_TIME',
  'BUCKET_TIME',
  'SNAPSHOT_DATE',
  'PUBLISHED_AT',
  'CALCULATED_AT',
  'NEXT_EVENT_DATE',
]);

function isDateColumn(key: string): boolean {
  if (key === 'TIMEFRAME') return false;
  const upperKey = key.toUpperCase();
  if (DATE_COLUMN_KEYS.has(upperKey)) return true;
  return upperKey.endsWith('_TIME') || upperKey.endsWith('_DATE') || upperKey.endsWith('_AT');
}

function formatDateValue(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString('en-US', { timeZone: 'America/New_York' });
}

function getDisplayValue(key: string, value: string): string {
  const upperKey = key.toUpperCase();
  return Z1_ENUM_VALUE_MAP[upperKey]?.[value] ?? Z1_ENUM_VALUE_MAP[upperKey]?.[value.toUpperCase()] ?? value;
}

function getTableLabel(tableKey: string): string {
  for (const group of Z1_TABLE_GROUPS) {
    const table = group.tables.find((entry) => entry.key === tableKey);
    if (table) return table.label;
  }
  return tableKey;
}

function generateColumns(data: any[]): ColumnDef<any>[] {
  if (data.length === 0) return [];
  const sample = data[0];

  return Object.keys(sample).map((key) => {
    const isNumber = typeof sample[key] === 'number';
    const isDate = isDateColumn(key);

    return {
      key,
      header: Z1_COLUMN_HEADER_MAP[key.toUpperCase()] ?? key,
      align: isNumber ? 'right' : 'left',
      mono: isNumber || isDate,
      render: (r: any) => {
        const val = r[key];
        if (val === null || val === undefined) return 'N/A';
        if (isDate && typeof val === 'string') return formatDateValue(val);
        if (typeof val === 'string') return getDisplayValue(key, val);
        if (isNumber && !Number.isInteger(val)) return val.toFixed(4);
        return String(val);
      },
    };
  });
}

export default function Z1DataExplorerPage() {
  const [activeTab, setActiveTab] = useState<string>('tech_indicator');
  const [search, setSearch] = useState('');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const rows = await fetchZ1TableData(activeTab);
        setData(rows || []);
      } catch (err) {
        console.error(err);
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [activeTab]);

  const filteredData = data.filter((row) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return Object.values(row).some((v) => String(v).toLowerCase().includes(searchLower));
  });

  const columns = generateColumns(data);
  const hasData = data.length > 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <PageHeader
        title="Z1 Explorer"
        description="Browse derived feature tables and inspect calculated rows."
        zone="Z1"
        actions={
          <Link href="/z1" className="text-sm font-medium text-white bg-[#00B894] hover:bg-[#00A884] px-4 py-2 rounded-lg transition-colors shadow-sm">
            Back to Z1
          </Link>
        }
      />

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-64 flex-shrink-0 space-y-6">
          {Z1_TABLE_GROUPS.map((group) => (
            <div key={group.name} className="bg-white rounded-xl shadow-sm border border-[#E8ECEF] overflow-hidden">
              <div className="bg-[#FAFBFC] px-4 py-2.5 border-b border-[#E8ECEF]">
                <h3 className="text-xs font-bold text-[#636E72] uppercase tracking-wider">{group.name}</h3>
              </div>
              <ul className="py-2">
                {group.tables.map((table) => (
                  <li key={table.key}>
                    <button
                      onClick={() => setActiveTab(table.key)}
                      className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors ${
                        activeTab === table.key
                          ? 'bg-[#E8FBF6] text-[#00B894] border-r-4 border-[#00B894]'
                          : 'text-[#1A1D23] hover:bg-[#F5F6FA] border-r-4 border-transparent'
                      }`}
                    >
                      {table.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex-1 bg-white rounded-xl shadow-sm border border-[#E8ECEF] p-4 overflow-hidden flex flex-col min-h-[500px]">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-bold text-[#1A1D23]">
                {getTableLabel(activeTab)}
              </h2>
              <p className="text-xs text-[#636E72] mt-0.5">Latest derived rows from the backend (max 100).</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#B2BEC3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search results..."
                  className="w-full rounded-lg border border-[#E8ECEF] bg-[#FAFBFC] pl-9 pr-3 py-2 text-sm text-[#1A1D23] placeholder-[#B2BEC3] focus:border-[#00B894] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E8FBF6] transition-all"
                />
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F6FA] rounded-md text-xs text-[#636E72]">
                <span className="font-data font-bold text-[#1A1D23]">{filteredData.length}</span>
                <span>rows</span>
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-0 relative">
            {loading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10">
                <div className="w-8 h-8 border-4 border-[#E8FBF6] border-t-[#00B894] rounded-full animate-spin" />
                <p className="mt-3 text-sm font-medium text-[#636E72]">Loading data...</p>
              </div>
            ) : null}

            {hasData ? (
              <div className="h-full overflow-auto rounded-lg border border-[#E8ECEF]">
                <DataTable
                  columns={columns}
                  data={filteredData}
                  keyField={columns[0]?.key || 'id'}
                  emptyMessage="No matching rows"
                  className="w-full"
                />
              </div>
            ) : !loading ? (
              <div className="h-full flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#E8ECEF] bg-[#FAFBFC] py-16">
                <svg className="w-12 h-12 text-[#B2BEC3] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
                <p className="text-base font-semibold text-[#1A1D23]">No data available</p>
                <p className="mt-1 text-sm text-[#636E72]">This table has not received any rows yet.</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
