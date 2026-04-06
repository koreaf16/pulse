/**
 * ============================================================================
 * @file        use-pipeline-lane-positions.ts
 * @description 실제 DOM 위치를 기준으로 pipeline lane 중심 좌표를 계산하는 훅.
 * @zone        INFRA
 * @domain      System
 *
 * [Architecture Context & Correlation]
 * @dependencies react
 * @called_by   components/pipeline/pipeline-live-view.tsx,
 *              components/pipeline/pipeline-tier-one-flow.tsx
 * @feeds_to    components/pipeline/pipeline-pipe.tsx
 *
 * @strict_rule
 *   1. 300라인 제한 준수.
 *   2. UI 측정 전용 로직만 포함.
 *   3. 브라우저 레이아웃 변경에만 반응.
 * ============================================================================
 */
'use client';

import { useEffect, useState, type MutableRefObject, type RefObject } from 'react';

export type LaneElementMap = Record<string, HTMLDivElement | null>;

interface Params {
  pipeRef: RefObject<HTMLDivElement | null>;
  sourceKeys: string[];
  targetKeys: string[];
  sourceMapRef: MutableRefObject<LaneElementMap>;
  targetMapRef: MutableRefObject<LaneElementMap>;
  deps?: ReadonlyArray<unknown>;
}

interface LanePositions {
  sourceOffsets: number[];
  targetOffsets: number[];
}

function measureOffsets(
  keys: string[],
  mapRef: MutableRefObject<LaneElementMap>,
  pipeRect: DOMRect,
): number[] {
  return keys.map((key) => {
    const node = mapRef.current[key];
    if (!node) return 0;
    const rect = node.getBoundingClientRect();
    return rect.top + rect.height / 2 - pipeRect.top;
  });
}

export function usePipelineLanePositions({
  pipeRef,
  sourceKeys,
  targetKeys,
  sourceMapRef,
  targetMapRef,
  deps = [],
}: Params): LanePositions {
  const [positions, setPositions] = useState<LanePositions>({ sourceOffsets: [], targetOffsets: [] });

  useEffect(() => {
    const measure = () => {
      const pipeNode = pipeRef.current;
      if (!pipeNode) return;
      const pipeRect = pipeNode.getBoundingClientRect();
      setPositions({
        sourceOffsets: measureOffsets(sourceKeys, sourceMapRef, pipeRect),
        targetOffsets: measureOffsets(targetKeys, targetMapRef, pipeRect),
      });
    };

    measure();
    const rafId = requestAnimationFrame(measure);
    const resizeObserver = new ResizeObserver(() => measure());
    const pipeNode = pipeRef.current;

    if (pipeNode) resizeObserver.observe(pipeNode);
    for (const key of sourceKeys) {
      const node = sourceMapRef.current[key];
      if (node) resizeObserver.observe(node);
    }
    for (const key of targetKeys) {
      const node = targetMapRef.current[key];
      if (node) resizeObserver.observe(node);
    }

    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [pipeRef, sourceKeys.join('|'), targetKeys.join('|'), ...deps]);

  return positions;
}
