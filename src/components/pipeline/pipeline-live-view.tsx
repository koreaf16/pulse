'use client';

import { useEffect, useRef, useState } from 'react';
import {
  fetchHealthComponents,
  fetchTableSizes,
  fetchZ1TableSizes,
  fetchZ2TableSizes,
  type TableSizeSummaryRow,
} from '@/lib/api';
import {
  TABLE_PRODUCERS,
  Z0_FEATURE_SOURCES,
  Z1_TARGETS,
  Z2_TARGETS,
  applyMetrics,
  buildStoredMap,
  sumRecentRows,
  type TableMetricMap,
} from './pipeline-monitor-config';
import { aggregateZoneMetrics } from './pipeline-flow-params';
import { PipelineTierOneFlow } from './pipeline-tier-one-flow';
import { PipelineStageFlow } from './pipeline-stage-flow';
import { PipelineStorageStatus } from './pipeline-storage-status';
import { PipelineSourcesTable } from './pipeline-sources-table';
import { PipelineFooter } from './pipeline-footer';

export function PipelineLiveView() {
  const clockRef = useRef<HTMLSpanElement>(null);
  const z0EvRef = useRef<HTMLSpanElement>(null);
  const z1EvRef = useRef<HTMLSpanElement>(null);
  const z2EvRef = useRef<HTMLSpanElement>(null);

  const [isZ0Flowing, setIsZ0Flowing] = useState(false);
  const [tableMetrics, setTableMetrics] = useState<TableMetricMap>({});
  const [zoneMetrics, setZoneMetrics] = useState({
    z0RecentRows: 0,
    z1RecentRows: 0,
    z0AvgLatencyMs: 0,
    z1AvgLatencyMs: 0,
    llmStatus: 'UNKNOWN' as string,
    dbStatus: 'UNKNOWN' as string,
    overallOk: true,
  });

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    const tick = () => {
      if (clockRef.current) clockRef.current.textContent = `${fmt.format(new Date())} ET`;
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const refresh = async () => {
      try {
        const [health, z0Rows, z1Rows, z2Rows] = await Promise.all([
          fetchHealthComponents(),
          fetchTableSizes(),
          fetchZ1TableSizes(),
          fetchZ2TableSizes(),
        ]);

        const stored = buildStoredMap(
          z0Rows as TableSizeSummaryRow[],
          z1Rows as TableSizeSummaryRow[],
          z2Rows,
        );

        const nextMetrics = Object.fromEntries(
          Object.entries(TABLE_PRODUCERS).map(([tableName, componentIds]) => [
            tableName,
            {
              generatedRows: sumRecentRows(health, componentIds),
              storedRows: stored.get(tableName) ?? 0,
            },
          ]),
        ) as TableMetricMap;

        setTableMetrics(nextMetrics);

        // Zone별 throughput 계산
        const z0Ids = health.filter((h) => h.componentType === 'collector').map((h) => h.componentId);
        const z1Ids = health.filter((h) => h.componentType === 'feature-engine').map((h) => h.componentId);
        const z0Metrics = aggregateZoneMetrics(health, z0Ids);
        const z1Metrics = aggregateZoneMetrics(health, z1Ids);
        const dbComp = health.find((h) => h.componentId === 'db-pool');
        const llmComp = health.find((h) => h.componentType === 'context-builder');
        const allOk = health.every((h) => h.status === 'UP' || h.status === 'UNKNOWN');

        setZoneMetrics({
          z0RecentRows: z0Metrics.totalRecentRows,
          z1RecentRows: z1Metrics.totalRecentRows,
          z0AvgLatencyMs: z0Metrics.avgLatencyMs,
          z1AvgLatencyMs: z1Metrics.avgLatencyMs,
          llmStatus: llmComp?.status ?? 'UNKNOWN',
          dbStatus: dbComp?.status ?? 'UNKNOWN',
          overallOk: allOk,
        });
      } catch {
        // Ignore telemetry refresh failures.
      }
    };

    refresh();
    const id = setInterval(refresh, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const ws = new WebSocket('ws://127.0.0.1:2002');

    ws.onmessage = (event) => {
      try {
        const { type, payload } = JSON.parse(event.data) as { type: string; payload: Record<string, string> };
        const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });

        if ((type === 'candle_closed' || type === 'liquidation' || type === 'news_collected') && z0EvRef.current) {
          z0EvRef.current.textContent = `${type.replaceAll('_', ' ')}: ${payload?.symbol ?? ''} @ ${timeStr}`;
        } else if (type === 'features_computed' && z1EvRef.current) {
          z1EvRef.current.textContent = `features computed @ ${timeStr}`;
        } else if ((type === 'global_context_generated' || type === 'local_context_generated') && z2EvRef.current) {
          const label = type === 'global_context_generated' ? 'global' : `local ${payload?.symbol ?? ''}`;
          z2EvRef.current.textContent = `context built (${label}) @ ${timeStr}`;
        }
      } catch (err) {
        console.error('WS message error:', err);
      }
    };

    ws.onerror = (err) => {
      console.error('WS error:', err);
    };

    return () => ws.close();
  }, []);

  const z0FeatureSources = applyMetrics(Z0_FEATURE_SOURCES, tableMetrics);
  const z1Targets = applyMetrics(Z1_TARGETS, tableMetrics);
  const z2Targets = applyMetrics(Z2_TARGETS, tableMetrics);

  return (
    <div className="flex h-full flex-col bg-[#FAFBFC]">
      <div className="z-20 flex h-14 flex-shrink-0 items-center justify-between border-b border-[#E5E7EB] bg-white px-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-md border border-blue-100 bg-blue-50">
            <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-sm font-bold tracking-widest text-[#0066FF]">PIPELINE MONITOR</span>
        </div>
        <div className="flex items-center gap-3 rounded-full border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-2 shadow-sm">
          <span className="h-3 w-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" style={{ animation: 'blink 1.2s ease-in-out infinite' }} />
          <span className="text-[11px] font-bold tracking-wide text-green-700">SYSTEM LIVE</span>
          <span className="text-[11px] text-[#9CA3AF]">|</span>
          <span ref={clockRef} className="font-data text-[11px] font-semibold text-green-700" />
        </div>
      </div>

      <div className="relative flex-1 overflow-y-auto px-8 py-10" style={{ backgroundImage: 'radial-gradient(#E5E7EB 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
        <div className="mx-auto max-w-6xl space-y-10">
          <div className="relative flex min-h-[540px] w-full rounded-2xl border border-[#E5E7EB] bg-white/40 p-6 shadow-sm backdrop-blur-md">
            <div className="absolute -top-3 left-6 rounded-full border border-blue-200 bg-blue-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700">
              Tier 1: 데이터 수집 (Ingestion)
            </div>
            <PipelineTierOneFlow
              tableMetrics={tableMetrics}
              eventRef={z0EvRef}
              eventDefault="원시 데이터 대기 중..."
              onActivityChange={setIsZ0Flowing}
            />
          </div>

          <div className="relative flex min-h-[440px] w-full items-start rounded-2xl border border-[#E5E7EB] bg-white/40 p-6 shadow-sm backdrop-blur-md">
            <div className="absolute -top-3 left-6 rounded-full border border-purple-200 bg-purple-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-purple-700">
              Tier 2: 특징 추출 (Feature Processing)
            </div>
            <PipelineStageFlow
              minHeight={390}
              pipeColor="#7C3AED"
              active={isZ0Flowing}
              recentRows={zoneMetrics.z0RecentRows}
              leftTargets={z0FeatureSources}
              rightTargets={z1Targets}
              leftNode={{
                zone: 'Z0',
                title: '특징 입력 데이터',
                borderColor: '#9CA3AF',
                glowAnim: 'none',
                status: { label: '스트리밍 중', color: '#6B7280', bg: '#F3F4F6' },
              }}
              rightNode={{
                zone: 'Z1',
                title: '특징 가공 엔진',
                borderColor: '#7C3AED',
                glowAnim: 'glowPurple',
                glowDelay: '0.5s',
                status: { label: '가공 중', color: '#7C3AED', bg: '#F5F3FF', spinner: true },
                eventRef: z1EvRef,
                eventDefault: '지표 업데이트 대기 중...',
              }}
              connections={[
                { sourceIdx: 0, targetIdx: 0, color: '#7C3AED' },
                { sourceIdx: 1, targetIdx: 1, color: '#8B5CF6' },
                { sourceIdx: 2, targetIdx: 1, color: '#8B5CF6' },
                { sourceIdx: 3, targetIdx: 1, color: '#8B5CF6' },
                { sourceIdx: 4, targetIdx: 1, color: '#8B5CF6' },
                { sourceIdx: 5, targetIdx: 2, color: '#A78BFA' },
                { sourceIdx: 6, targetIdx: 2, color: '#A78BFA' },
                { sourceIdx: 7, targetIdx: 2, color: '#A78BFA' },
                { sourceIdx: 8, targetIdx: 3, color: '#C4B5FD' },
              ]}
            />
          </div>

          <div className="relative flex min-h-[250px] w-full items-start rounded-2xl border border-[#E5E7EB] bg-white/40 p-6 shadow-sm backdrop-blur-md">
            <div className="absolute -top-3 left-6 rounded-full border border-pink-200 bg-pink-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-pink-700">
              Tier 3: 문맥 생성 (Context Generation)
            </div>
            <PipelineStageFlow
              minHeight={220}
              pipeColor="#DB2777"
              recentRows={zoneMetrics.z1RecentRows}
              leftTargets={z1Targets}
              rightTargets={z2Targets}
              leftNode={{
                zone: 'Z1',
                title: '가공된 특징 데이터',
                borderColor: '#9CA3AF',
                glowAnim: 'none',
                status: { label: '준비 완료', color: '#6B7280', bg: '#F3F4F6' },
              }}
              rightNode={{
                zone: 'Z2',
                title: '문맥 분석 엔진',
                borderColor: '#DB2777',
                glowAnim: 'glowPink',
                glowDelay: '1s',
                status: { label: '추론 중', color: '#DB2777', bg: '#FDF2F8' },
                eventRef: z2EvRef,
                eventDefault: '문맥 생성 대기 중...',
              }}
              connections={[
                { sourceIdx: 0, targetIdx: 0, color: '#F472B6' },
                { sourceIdx: 1, targetIdx: 0, color: '#F472B6' },
                { sourceIdx: 2, targetIdx: 1, color: '#DB2777' },
                { sourceIdx: 3, targetIdx: 2, color: '#F9A8D4' },
              ]}
            />
          </div>

          <div className="flex flex-col gap-8">
            <PipelineSourcesTable />
            <PipelineStorageStatus />
          </div>
        </div>
      </div>

      <PipelineFooter
        overallOk={zoneMetrics.overallOk}
        z0AvgLatencyMs={zoneMetrics.z0AvgLatencyMs}
        z1AvgLatencyMs={zoneMetrics.z1AvgLatencyMs}
        llmStatus={zoneMetrics.llmStatus}
        dbStatus={zoneMetrics.dbStatus}
      />
    </div>
  );
}
