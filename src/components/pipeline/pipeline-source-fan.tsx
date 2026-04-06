/**
 * ============================================================================
 * @file        pipeline-source-fan.tsx
 * @description 왼쪽 세로 소스 목록 + 가로 플로우 라인 + 머지 바 시각화.
 * @zone        INFRA
 * @domain      System
 *
 * @dependencies react, @/lib/api
 * @called_by   components/pipeline/pipeline-live-view.tsx
 * @feeds_to    -
 *
 * @strict_rule
 *   1. 300라인 제한 준수.
 *   2. 더미 데이터 사용 금지 — 백엔드 API만 사용.
 *   3. API 오류 시 로딩/오프라인 상태 표시.
 * ============================================================================
 */
'use client';

import { useEffect, useState, useCallback } from 'react';
import { fetchCollectors, fetchHealthComponents } from '@/lib/api';
import type { CollectorStatus, ComponentHealth } from '@/lib/api';
import { computeFlowParams } from './pipeline-flow-params';

interface CollectorRowData {
  id: string;
  label: string;
  color: string;
  rows: number;
  recentRows: number;
  status: 'running' | 'error' | 'stopped';
}

const PROVIDER_COLORS: Record<string, string> = {
  binance: '#3B82F6',
  fred: '#F59E0B',
  coingecko: '#22C55E',
  yahoo: '#EF4444',
  rss: '#8B5CF6',
  cryptoquant: '#06B6D4',
  coinglass: '#EC4899',
};

function getColor(sourceId: string): string {
  if (sourceId.startsWith('binance')) return PROVIDER_COLORS.binance;
  if (sourceId.startsWith('fred')) return PROVIDER_COLORS.fred;
  if (sourceId.startsWith('coingecko')) return PROVIDER_COLORS.coingecko;
  if (sourceId.startsWith('yahoo')) return PROVIDER_COLORS.yahoo;
  if (sourceId.startsWith('rss')) return PROVIDER_COLORS.rss;
  if (sourceId.startsWith('cryptoquant')) return PROVIDER_COLORS.cryptoquant;
  if (sourceId.startsWith('coinglass')) return PROVIDER_COLORS.coinglass;
  return '#6B7280';
}

function buildRows(collectors: CollectorStatus[], health: ComponentHealth[]): CollectorRowData[] {
  const hm = new Map(health.map((h) => [h.componentId, h]));

  return collectors.map((c) => {
    const h = hm.get(c.sourceId);
    const hasHealthIssue = h?.status === 'DOWN' || h?.status === 'DEGRADED';
    let status: CollectorRowData['status'] = 'stopped';
    
    if (c.running && !hasHealthIssue) status = 'running';
    else if (!c.running && !hasHealthIssue) status = 'stopped';
    else status = 'error';

    return {
      id: c.sourceId,
      label: c.label,
      color: getColor(c.sourceId),
      rows: c.totalRows ?? h?.metrics?.totalRows ?? 0,
      recentRows: h?.metrics?.recentRows ?? 0,
      status,
    };
  });
}

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(n);
}

const DOT_COLOR: Record<string, string> = { running: '#00B894', error: '#D63031', stopped: '#B2BEC3' };

interface Props { 
  onGroupsChange?: (active: number, total: number) => void;
  onActivityChange?: (isFlowing: boolean) => void;
}

export function PipelineSourceFan({ onGroupsChange, onActivityChange }: Props) {
  const [rows, setRows]       = useState<CollectorRowData[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const [col, hp] = await Promise.all([fetchCollectors(), fetchHealthComponents()]);
      if (col.length === 0 && hp.length === 0) { setLoading(true); return; }
      const r = buildRows(col, hp);
      setRows(r);
      setLoading(false);
      onGroupsChange?.(r.filter((x) => x.status === 'running').length, r.length);
      
      const isFlowing = r.some(x => x.status === 'running' && x.recentRows > 0);
      onActivityChange?.(isFlowing);
    } catch {
      // Ignore
    }
  }, [onGroupsChange, onActivityChange]);

  useEffect(() => { refresh(); const id = setInterval(refresh, 1000); return () => clearInterval(id); }, [refresh]);

  const act = rows.filter((r) => r.status === 'running').length;
  
  // Dummy placeholders while loading
  const rowsToRender = loading 
    ? Array.from({ length: 8 }).map((_, i) => ({ id: `loading-${i}`, label: 'Loading...', color: '#E5E7EB', rows: 0, recentRows: 0, status: 'stopped' } as CollectorRowData))
    : rows;

  // Layout parameters for perfect SVG alignment
  const rowHeight = 24; // px (denser list for individual sources)
  const headerHeight = 24; // px
  const svgWidth = 140; // px
  const svgHeight = rowsToRender.length * rowHeight;
  const targetY = svgHeight / 2;

  return (
    <div className="flex items-start flex-shrink-0">
      {/* ── 소스 리스트 (고정 높이) ─────────────────────── */}
      <div className="flex flex-col w-[220px] relative z-10 bg-white/50 backdrop-blur-sm rounded-lg border border-[#E5E7EB] shadow-sm overflow-hidden" style={{ height: headerHeight + svgHeight + 8 }}>
        {/* 헤더 */}
        <div className="flex items-center justify-between px-3 mb-1 bg-[#F9FAFB] border-b border-[#E5E7EB]" style={{ height: headerHeight }}>
          <span className="text-[9px] font-bold tracking-widest text-[#6B7280] uppercase">Sources</span>
          {loading
            ? <span className="text-[9px] text-[#9CA3AF]">...</span>
            : <span className="text-[9px] font-data font-bold text-[#374151]">
                <span style={{ color: '#00B894' }}>{act}</span>
                <span className="text-[#9CA3AF]">/{rows.length}</span>
              </span>
          }
        </div>

        {/* 리스트 */}
        <div className="flex flex-col px-1 pt-1 overflow-y-auto custom-scrollbar">
          {rowsToRender.map((r, i) => (
            <SourceRow key={r.id} r={r} loading={loading} rowHeight={rowHeight} />
          ))}
        </div>
      </div>

      {/* ── SVG 유기적 팬 커넥터 (Fan Connector) ─────────────────── */}
      <div className="relative flex-shrink-0" style={{ width: svgWidth, height: svgHeight, marginTop: 16 }}>
        <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
          {/* 필터 선언: Glow 효과 */}
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="strongGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComponentTransfer in="blur" result="glow">
                <feFuncA type="linear" slope="2" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {rowsToRender.map((r, i) => {
            const y1 = i * rowHeight + (rowHeight / 2);
            
            // Route sources to one of 4 specific lanes
            let targetIdx = 0; // Default: Z0_PRICE_CANDLE
            if (r.id.startsWith('coinglass')) targetIdx = 1; // Z0_PERP_FUNDING
            if (r.id.startsWith('fred')) targetIdx = 2;      // Z0_ECON_TIMESERIES
            if (r.id.startsWith('rss')) targetIdx = 3;       // Z0_NEWS_FEED

            // Lane offsets match PipelinePipe's 4 lanes (height 120, laneHeight 28)
            const laneOffset = [-42, -14, 14, 42][targetIdx] || 0;
            const endY = targetY + laneOffset;

            // x1 시작점을 Source 리스트 박스의 오른쪽 경계와 맞춤
            const pathData = `M 0,${y1} C ${svgWidth * 0.4},${y1} ${svgWidth * 0.6},${endY} ${svgWidth},${endY}`;
            const ok = r.status === 'running' && !loading;
            const err = r.status === 'error';
            const strokeColor = ok ? r.color : (err ? '#D63031' : '#E5E7EB');
            const opacity = ok ? 0.3 : (err ? 0.5 : 0.2);
            
            // 데이터가 최근에 들어온 경우에만 흐르는 애니메이션 표시
            const isFlowing = ok && r.recentRows > 0;

            return (
              <g key={r.id}>
                {/* 배경 라인 */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={ok ? "3" : "1.5"}
                  strokeDasharray={err ? "3 3" : "none"}
                  opacity={opacity}
                  style={{ transition: 'stroke 0.3s ease' }}
                />

                {/* 코어 얇은 라인 (곡선과 맞춤) */}
                {ok && (
                  <path
                    d={pathData}
                    fill="none"
                    stroke={r.color}
                    strokeWidth="0.8"
                    opacity="0.6"
                  />
                )}
                
                {/* 흐르는 점 (애니메이션) */}
                {isFlowing && (
                  <>
                    <circle r="2.5" fill="#FFF" filter="url(#strongGlow)">
                      <animateMotion dur={`${computeFlowParams(r.recentRows).duration + (i * 0.05)}s`} repeatCount="indefinite" path={pathData} calcMode="linear" />
                    </circle>
                    <circle r="1.4" fill={r.color}>
                      <animateMotion dur={`${computeFlowParams(r.recentRows).duration + (i * 0.05)}s`} repeatCount="indefinite" path={pathData} calcMode="linear" />
                    </circle>
                  </>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function SourceRow({ r, loading, rowHeight }: { r: CollectorRowData; loading: boolean; rowHeight: number }) {
  const ok   = r.status === 'running';
  const off  = r.status === 'stopped' || loading;

  return (
    <div className="flex items-center gap-1.5 px-2 hover:bg-[#F9FAFB] transition-colors rounded" style={{ height: rowHeight }}>
      {/* Status dot */}
      <span className={`w-[6px] h-[6px] rounded-full flex-shrink-0 ${ok && !loading ? 'animate-pulse' : ''}`}
        style={{ 
          background: DOT_COLOR[r.status],
          boxShadow: ok && !loading ? `0 0 4px ${DOT_COLOR[r.status]}` : 'none'
        }} />

      {/* Name */}
      <span className="text-[9px] font-medium flex-1 truncate" title={r.label}
        style={{ color: off ? '#9CA3AF' : r.color }}>{r.label}</span>

      {/* 1m Count */}
      {!loading && (
        <span className="text-[8px] font-data font-bold text-right px-1.5 py-0.5 rounded bg-blue-50/50 text-[#2563EB] border border-blue-100/30">
          {fmt(r.recentRows)}
        </span>
      )}
    </div>
  );
}
