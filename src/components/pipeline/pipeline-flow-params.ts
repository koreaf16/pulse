/**
 * ============================================================================
 * @file        pipeline-flow-params.ts
 * @description recentRows 수치를 SVG 애니메이션 파라미터로 변환하는 순수 유틸.
 * @zone        INFRA
 * @domain      System
 *
 * [Architecture Context & Correlation]
 * @dependencies @/lib/api
 * @called_by   components/pipeline/pipeline-pipe.tsx,
 *              components/pipeline/pipeline-tier-one-flow.tsx,
 *              components/pipeline/pipeline-source-fan.tsx,
 *              components/pipeline/pipeline-stage-flow.tsx,
 *              components/pipeline/pipeline-live-view.tsx
 * @feeds_to    -
 *
 * @strict_rule
 *   1. 300라인 제한 준수.
 *   2. 순수 함수만 — 사이드이펙트 없음.
 *   3. 모든 애니메이션 속도 매핑은 이 파일에서만 정의.
 * ============================================================================
 */

import type { ComponentHealth } from '@/lib/api';

export interface FlowParams {
  /** animateMotion dur 값 (초). isActive=false 시 사용 안 함 */
  duration: number;
  /** 파이프에 표시할 패킷(원) 개수 */
  packetCount: number;
  /** 파이프 배경 라인 투명도 */
  opacity: number;
  /** true일 때만 애니메이션 렌더 */
  isActive: boolean;
}

/**
 * recentRows(최근 60초 수집 행 수)를 기반으로 SVG 애니메이션 파라미터를 결정한다.
 * 처리량이 높을수록 duration이 짧아지고(빠른 애니메이션), 패킷 수가 늘어난다.
 */
export function computeFlowParams(recentRows: number): FlowParams {
  if (recentRows <= 0) {
    return { duration: 2.0, packetCount: 0, opacity: 0.15, isActive: false };
  }
  if (recentRows < 5) {
    return { duration: 3.5, packetCount: 1, opacity: 0.35, isActive: true };
  }
  if (recentRows < 50) {
    return { duration: 2.0, packetCount: 2, opacity: 0.5, isActive: true };
  }
  if (recentRows < 500) {
    return { duration: 1.2, packetCount: 3, opacity: 0.65, isActive: true };
  }
  return { duration: 0.7, packetCount: 4, opacity: 0.8, isActive: true };
}

/**
 * health 컴포넌트 배열에서 특정 componentId 목록의 recentRows 합계와
 * avgLatencyMs 평균을 계산한다.
 */
export function aggregateZoneMetrics(
  health: ComponentHealth[],
  componentIds: string[],
): { totalRecentRows: number; avgLatencyMs: number } {
  const matched = health.filter((h) => componentIds.includes(h.componentId));
  const totalRecentRows = matched.reduce(
    (sum, h) => sum + (h.metrics?.recentRows ?? 0),
    0,
  );
  const latencies = matched
    .map((h) => h.metrics?.avgLatencyMs ?? 0)
    .filter((ms) => ms > 0);
  const avgLatencyMs =
    latencies.length > 0
      ? Math.round(latencies.reduce((s, v) => s + v, 0) / latencies.length)
      : 0;

  return { totalRecentRows, avgLatencyMs };
}

/** packetCount 개수만큼 균등 분할된 delay 배열을 생성한다 */
export function buildPacketDelays(packetCount: number): number[] {
  if (packetCount <= 0) return [];
  return Array.from({ length: packetCount }, (_, i) => i / packetCount);
}
