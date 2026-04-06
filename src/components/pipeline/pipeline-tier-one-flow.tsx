/**
 * ============================================================================
 * @file        pipeline-tier-one-flow.tsx
 * @description Tier 1 source list에서 Z0 실제 적재 테이블로 직접 연결선을 그리는 컴포넌트.
 * @zone        INFRA
 * @domain      System
 *
 * @dependencies react, @/lib/api, ./pipeline-zone-node
 * @called_by   components/pipeline/pipeline-live-view.tsx
 * @feeds_to    -
 *
 * @strict_rule
 *   1. 300라인 제한 준수.
 *   2. 백엔드 API만 사용해 상태를 조회.
 *   3. 시각화 좌표 계산은 UI 전용 로직으로만 유지.
 * ============================================================================
 */
'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { fetchCollectors, fetchHealthComponents, type CollectorStatus, type ComponentHealth } from '@/lib/api';
import { PipelineMotionPath } from './pipeline-motion-path';
import { computeFlowParams, buildPacketDelays } from './pipeline-flow-params';
import { PipelineZoneNode } from './pipeline-zone-node';
import { Z0_RAW_TARGETS, applyMetrics, getSourceColor, resolveZ0Targets } from './pipeline-monitor-config';
import { usePipelineLanePositions, type LaneElementMap } from './use-pipeline-lane-positions';

interface CollectorRowData {
  id: string;
  label: string;
  color: string;
  rows: number;
  recentRows: number;
  status: 'running' | 'error' | 'stopped';
}

interface Props {
  tableMetrics: Record<string, { generatedRows?: number; storedRows?: number }>;
  eventRef?: RefObject<HTMLSpanElement | null>;
  eventDefault?: string;
  onActivityChange?: (isFlowing: boolean) => void;
}

const ROW_HEIGHT = 24;
const HEADER_HEIGHT = 28;
const PIPE_MIN_HEIGHT = 420;

function buildRows(collectors: CollectorStatus[], health: ComponentHealth[]): CollectorRowData[] {
  const healthMap = new Map(health.map((entry) => [entry.componentId, entry]));
  return collectors.map((collector) => {
    const component = healthMap.get(collector.sourceId);
    const hasIssue = component?.status === 'DOWN' || component?.status === 'DEGRADED';
    const status: CollectorRowData['status'] =
      collector.running && !hasIssue ? 'running' : hasIssue ? 'error' : 'stopped';

    return {
      id: collector.sourceId,
      label: collector.label,
      color: getSourceColor(collector.sourceId),
      rows: collector.totalRows ?? component?.metrics?.totalRows ?? 0,
      recentRows: component?.metrics?.recentRows ?? 0,
      status,
    };
  });
}

function formatCount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return `${value}`;
}

export function PipelineTierOneFlow({ tableMetrics, eventRef, eventDefault, onActivityChange }: Props) {
  const pipeRef = useRef<HTMLDivElement>(null);
  const sourceRefs = useRef<LaneElementMap>({});
  const targetRefs = useRef<LaneElementMap>({});
  const prevRowsRef = useRef<Record<string, number>>({});
  const [rows, setRows] = useState<(CollectorRowData & { rps?: number })[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const [collectors, health] = await Promise.all([fetchCollectors(), fetchHealthComponents()]);
      if (collectors.length === 0 && health.length === 0) {
        setLoading(true);
        return;
      }

      const nextRows = buildRows(collectors, health);
      
      const updatedRows = nextRows.map(row => {
        const prevValue = prevRowsRef.current[row.id] ?? row.recentRows;
        let delta = row.recentRows - prevValue;
        if (delta < 0) delta = 0; // 백엔드 리셋 시점 처리
        
        prevRowsRef.current[row.id] = row.recentRows;
        return { ...row, rps: delta };
      });

      setRows(updatedRows);
      setLoading(false);
      onActivityChange?.(nextRows.some((row) => row.status === 'running' || row.recentRows > 0));
    } catch {
      // Ignore transient polling errors.
    }
  }, [onActivityChange]);
  useEffect(() => {
    refresh();
    const intervalId = setInterval(refresh, 1000); // 1초 주기로 리프레시
    return () => clearInterval(intervalId);
  }, [refresh]);

  const targets = useMemo(() => applyMetrics(Z0_RAW_TARGETS, tableMetrics), [tableMetrics]);

  const rowsToRender = loading
      ? Array.from({ length: 10 }, (_, index) => ({
        id: `loading-${index}`,
        label: 'Loading...',
        color: '#CBD5E1',
        rows: 0,
        recentRows: 0,
        rps: 0,
        status: 'stopped' as const,
      }))
    : rows;

  const registerSourceRef = useCallback((label: string, node: HTMLDivElement | null) => {
    sourceRefs.current[label] = node;
  }, []);

  const registerTargetRef = useCallback((label: string, node: HTMLDivElement | null) => {
    // PipelineMonitorConfig의 id 또는 label을 키로 사용
    targetRefs.current[label] = node;
  }, []);

  const sourceKeys = rowsToRender.map((row) => row.id);
  const targetKeys = targets.map((target) => target.id || target.label);
  const { sourceOffsets, targetOffsets } = usePipelineLanePositions({
    pipeRef,
    sourceKeys,
    targetKeys,
    sourceMapRef: sourceRefs,
    targetMapRef: targetRefs,
    deps: [rowsToRender.length, targets.length, loading],
  });

  const pipeHeight = Math.max(PIPE_MIN_HEIGHT, HEADER_HEIGHT + rowsToRender.length * ROW_HEIGHT + 18);
  const targetIndexMap = new Map(targetKeys.map((id, index) => [id, index]));

  return (
    <div className="flex min-h-[440px] w-full items-start">
      <div className="bg-white rounded-2xl p-4 mx-auto w-[430px] flex flex-col self-stretch justify-between border-[2.5px] border-[#93C5FD]">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold leading-none text-[#2563EB]">SRC</span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[#6B7280]">실시간 데이터 유입</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border px-2 py-0.5 bg-[#EFF6FF]" style={{ borderColor: '#93C5FD' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" style={{ boxShadow: '0 0 6px #2563EB' }} />
              <span className="text-[9px] font-bold text-[#2563EB]">
                {loading ? '동기화 중' : `${rows.filter((row) => row.status === 'running' || row.recentRows > 0).length}/${rows.length} 활성화`}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2 my-4">
          {rowsToRender.map((row) => (
            <div
              key={row.id}
              ref={(node) => registerSourceRef(row.id, node)}
              className="flex min-h-8 items-center justify-between gap-2 px-3 py-1.5 rounded-lg border bg-[#F9FAFB] shadow-sm relative z-10"
              style={{ borderColor: `${(row.status === 'stopped' ? '#CBD5E1' : row.color)}40` }}
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className={`h-[6px] w-[6px] flex-shrink-0 rounded-full ${row.status === 'running' && !loading ? 'animate-pulse' : ''}`}
                  style={{ background: row.status === 'error' ? '#DC2626' : row.status === 'stopped' ? '#CBD5E1' : row.color }}
                />
                <span className="flex-1 text-[9px] font-medium text-slate-700 whitespace-nowrap" title={row.label}>
                  {row.label}
                </span>
              </div>
              <div className="flex flex-shrink-0 items-center">
                {!loading && (
                  <span 
                    key={`${row.id}-${row.rps}`}
                    className="flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-[10px] font-data font-bold text-[#2563EB] border border-blue-100 shadow-[0_0_10px_rgba(37,99,235,0.15)] animate-in fade-in scale-105 duration-75"
                  >
                    {row.rps?.toLocaleString()} <span className="text-[7px] opacity-60 font-sans">/s</span>
                  </span>
                )}
              </div>
            </div>
          ))}
          </div>
        </div>
      </div>

      <div ref={pipeRef} className="relative flex-1 px-4" style={{ height: pipeHeight }}>
        <svg className="absolute inset-0 h-full w-full" style={{ overflow: 'visible' }}>
          {rowsToRender.map((row, index) => {
            const y1 = sourceOffsets[index];
            const isActive = !loading && (row.status === 'running' || row.recentRows > 0);
            const stroke = row.status === 'error' ? '#DC2626' : row.color;
            const backgroundOpacity = row.status === 'running' ? 1 : row.status === 'error' ? 0.54 : 0.3;
            const coreOpacity = row.status === 'running' ? 0.78 : row.status === 'error' ? 0.48 : 0.24;

            return resolveZ0Targets(row.id).map((targetLabel, branchIndex) => {
              const targetIdx = targetIndexMap.get(targetLabel);
              const y2 = targetIdx == null ? 0 : targetOffsets[targetIdx];
              if (!y1 || !y2) return null;
              const width = pipeRef.current?.getBoundingClientRect().width ?? 320;
              const curveInset = branchIndex === 0 ? width * 0.24 : width * 0.34;
              const pathData = `M 0,${y1} C ${curveInset},${y1} ${width - curveInset},${y2} ${width},${y2}`;

              const flowParams = computeFlowParams(row.recentRows);
              const laneDuration = flowParams.duration + (index * 0.05);

              return (
                <PipelineMotionPath
                  key={`${row.id}-${targetLabel}`}
                  pathData={pathData}
                  color={stroke}
                  active={isActive && flowParams.isActive}
                  duration={laneDuration}
                  packetDelays={buildPacketDelays(flowParams.packetCount)}
                  backgroundOpacity={backgroundOpacity * flowParams.opacity}
                  coreOpacity={coreOpacity * flowParams.opacity}
                  dashedOpacity={0.48}
                  start={{ x: 0, y: y1, radius: 2, opacity: Math.max(coreOpacity, 0.35) }}
                  end={{ x: width, y: y2, radius: 2.2, opacity: Math.max(coreOpacity, 0.45) }}
                />
              );
            });
          })}
        </svg>
      </div>

      <div className="w-[430px] flex-shrink-0 self-stretch">
        <PipelineZoneNode
          zone="Z0"
          title="원시 데이터 수집 (Z0)"
          borderColor="#2563EB"
          glowAnim="glowBlue"
          status={{ label: '활성 상태', color: '#16A34A', bg: '#DCFCE7' }}
          targets={targets}
          eventRef={eventRef}
          eventDefault={eventDefault}
          registerTargetRef={registerTargetRef}
        />
      </div>
    </div>
  );
}
