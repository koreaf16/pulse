/**
 * ============================================================================
 * @file        pipeline-stage-flow.tsx
 * @description Tier 2/3용 좌우 zone 카드와 측정 기반 pipe를 묶는 공통 stage 컴포넌트.
 * @zone        INFRA
 * @domain      System
 *
 * [Architecture Context & Correlation]
 * @dependencies react, ./pipeline-pipe, ./pipeline-zone-node,
 *               ./use-pipeline-lane-positions
 * @called_by   components/pipeline/pipeline-live-view.tsx
 * @feeds_to    -
 *
 * @strict_rule
 *   1. 300라인 제한 준수.
 *   2. DOM 측정은 시각 정렬 보정 용도로만 사용.
 *   3. 데이터 가공 없이 전달받은 구성만 렌더링.
 * ============================================================================
 */
'use client';

import { useCallback, useRef } from 'react';
import type { RefObject } from 'react';
import { PipelineMotionPath } from './pipeline-motion-path';
import { computeFlowParams, buildPacketDelays } from './pipeline-flow-params';
import { PipelinePipe, type PipeConnection } from './pipeline-pipe';
import { PipelineZoneNode, type TargetTable } from './pipeline-zone-node';
import { usePipelineLanePositions, type LaneElementMap } from './use-pipeline-lane-positions';

interface StageStatus {
  label: string;
  color: string;
  bg: string;
  spinner?: boolean;
}

interface StageNodeConfig {
  zone: string;
  title: string;
  borderColor: string;
  glowAnim: string;
  glowDelay?: string;
  status: StageStatus;
  eventRef?: RefObject<HTMLSpanElement | null>;
  eventDefault?: string;
}

interface OverlaySource {
  label: string;
  color: string;
  targetLabels: string[];
}

interface PipelineStageFlowProps {
  minHeight: number;
  pipeColor: string;
  active?: boolean;
  connections: PipeConnection[];
  leftTargets: TargetTable[];
  rightTargets: TargetTable[];
  leftNode: StageNodeConfig;
  rightNode: StageNodeConfig;
  overlaySources?: OverlaySource[];
  recentRows?: number;
}

export function PipelineStageFlow({
  minHeight,
  pipeColor,
  active = true,
  connections,
  leftTargets,
  rightTargets,
  leftNode,
  rightNode,
  overlaySources,
  recentRows,
}: PipelineStageFlowProps) {
  const pipeRef = useRef<HTMLDivElement>(null);
  const sourceRefs = useRef<LaneElementMap>({});
  const targetRefs = useRef<LaneElementMap>({});
  const overlayRefs = useRef<LaneElementMap>({});

  const registerSourceRef = useCallback((label: string, node: HTMLDivElement | null) => {
    sourceRefs.current[label] = node;
  }, []);

  const registerTargetRef = useCallback((label: string, node: HTMLDivElement | null) => {
    targetRefs.current[label] = node;
  }, []);

  const registerOverlayRef = useCallback((label: string, node: HTMLDivElement | null) => {
    overlayRefs.current[label] = node;
  }, []);

  const sourceKeys = leftTargets.map((target) => target.id || target.label);
  const targetKeys = rightTargets.map((target) => target.id || target.label);
  const { sourceOffsets, targetOffsets } = usePipelineLanePositions({
    pipeRef,
    sourceKeys,
    targetKeys,
    sourceMapRef: sourceRefs,
    targetMapRef: targetRefs,
    deps: [leftTargets.length, rightTargets.length, minHeight],
  });
  const overlayKeys = overlaySources?.map((source) => source.label) ?? [];
  const { sourceOffsets: overlayOffsets } = usePipelineLanePositions({
    pipeRef,
    sourceKeys: overlayKeys,
    targetKeys,
    sourceMapRef: overlayRefs,
    targetMapRef: targetRefs,
    deps: [overlayKeys.length, rightTargets.length, minHeight],
  });
  const targetIndexMap = new Map(targetKeys.map((id, index) => [id, index]));
  const overlayWidth = pipeRef.current?.getBoundingClientRect().width ?? 0;

  return (
    <div className="flex w-full items-stretch" style={{ minHeight }}>
      <div className="w-[430px] flex-shrink-0 self-stretch">
        <PipelineZoneNode
          zone={leftNode.zone}
          title={leftNode.title}
          borderColor={leftNode.borderColor}
          glowAnim={leftNode.glowAnim}
          glowDelay={leftNode.glowDelay}
          status={leftNode.status}
          targets={leftTargets}
          registerTargetRef={registerSourceRef}
        />
      </div>

      <div ref={pipeRef} className="relative flex-1 self-stretch px-4">
        {overlaySources && overlaySources.length > 0 && (
          <>
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[132px]">
              <div className="mt-4 mb-2 pl-2 text-[9px] font-bold uppercase tracking-[0.24em] text-[#94A3B8]">
                Direct Z0
              </div>
              <div className="relative">
                {overlaySources.map((source, index) => (
                  <div
                    key={source.label}
                    ref={(node) => registerOverlayRef(source.label, node)}
                    className="absolute left-2 flex min-h-8 items-center gap-2 rounded-lg border border-dashed bg-white/85 px-2.5 py-1 shadow-sm"
                    style={{ top: `${24 + index * 42}px`, borderColor: `${source.color}55` }}
                  >
                    <span className="h-[6px] w-[6px] rounded-full" style={{ background: source.color }} />
                    <span className="text-[8px] font-mono font-bold text-slate-700">{source.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <svg className="pointer-events-none absolute inset-0 z-0 h-full w-full" style={{ overflow: 'visible' }}>
              {overlaySources.flatMap((source, sourceIndex) =>
                source.targetLabels.map((targetLabel, targetIndex) => {
                  const y1 = overlayOffsets[sourceIndex];
                  const resolvedTargetIndex = targetIndexMap.get(targetLabel);
                  const y2 = resolvedTargetIndex == null ? 0 : targetOffsets[resolvedTargetIndex];
                  if (!y1 || !y2 || !overlayWidth) return [];
                  const startX = 108;
                  const pathData = `M ${startX},${y1} C ${overlayWidth * 0.32},${y1} ${overlayWidth * 0.68},${y2} ${overlayWidth},${y2}`;
                  const overlayFlow = computeFlowParams(recentRows ?? 0);
                  return [
                    <PipelineMotionPath
                      key={`${source.label}-${targetLabel}`}
                      pathData={pathData}
                      color={source.color}
                      active={active && overlayFlow.isActive}
                      duration={overlayFlow.duration + (sourceIndex * 0.12) + (targetIndex * 0.08)}
                      packetDelays={buildPacketDelays(Math.min(overlayFlow.packetCount, 2))}
                      variant="subtle"
                      backgroundOpacity={0.72 * overlayFlow.opacity}
                      coreOpacity={0.6 * overlayFlow.opacity}
                      dashedOpacity={0.42}
                      start={{ x: startX, y: y1, radius: 2.4, opacity: 0.7 }}
                      end={{ x: overlayWidth, y: y2, radius: 2.7, opacity: 0.78 }}
                    />,
                  ];
                }),
              )}
            </svg>
          </>
        )}
        <PipelinePipe
          color={pipeColor}
          sourceCount={leftTargets.length}
          targetCount={rightTargets.length}
          connections={connections}
          height={minHeight}
          active={active}
          origin="straight"
          sourceOffsets={sourceOffsets}
          targetOffsets={targetOffsets}
          recentRows={recentRows}
        />
      </div>

      <div className="w-[430px] flex-shrink-0 self-stretch">
        <PipelineZoneNode
          zone={rightNode.zone}
          title={rightNode.title}
          borderColor={rightNode.borderColor}
          glowAnim={rightNode.glowAnim}
          glowDelay={rightNode.glowDelay}
          status={rightNode.status}
          targets={rightTargets}
          eventRef={rightNode.eventRef}
          eventDefault={rightNode.eventDefault}
          registerTargetRef={registerTargetRef}
        />
      </div>
    </div>
  );
}
