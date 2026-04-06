/**
 * ============================================================================
 * @file        page.tsx
 * @description Pipeline Overview 페이지 — Z0→Z1→Z2 실시간 파이프라인 흐름 시각화.
 * @zone        INFRA
 * @domain      System
 *
 * @dependencies @/components/pipeline/pipeline-live-view
 * @called_by   Next.js App Router (/)
 * @feeds_to    -
 *
 * @strict_rule 300라인 제한 준수.
 * ============================================================================
 */
import { PipelineLiveView } from '@/components/pipeline/pipeline-live-view';

export default function PipelineOverviewPage() {
  return <PipelineLiveView />;
}
