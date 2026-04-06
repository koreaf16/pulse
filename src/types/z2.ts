/**
 * ============================================================================
 * @file        z2.ts
 * @description Z2 Context Zone 테이블 행 타입을 정의하는 모듈.
 * @zone        Z2
 * @domain      Context
 *
 * @dependencies ./common
 * @called_by   더미 데이터 파일, Z2 컴포넌트
 * @feeds_to    global-context-card, local-context-card, context-history
 *
 * @strict_rule
 *   1. 300라인 제한 준수.
 *   2. Z2_SPEC.md 스키마와 1:1 대응 유지.
 * ============================================================================
 */
import type { Symbol, ISOTimestamp } from './common';

/** Z2 컨텍스트 업데이트 트리거 종류 */
export type ContextTrigger =
  | 'daily_close'
  | 'threshold_breach'
  | 'manual';

/** Z2_GLOBAL_CONTEXT — 시장 전체 컨텍스트 */
export interface Z2GlobalContext {
  contextId: string;
  generatedAt: ISOTimestamp;
  trigger: ContextTrigger;
  promptVersion: string;
  // LLM 생성 텍스트
  marketRegimeSummary: string;
  macroOutlook: string;
  sentimentSummary: string;
  keyRisks: string[];
  keyOpportunities: string[];
  // 메타
  llmModel: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  // 임베딩
  embeddingVector: number[] | null;  // 1024차원 (표시 시 null)
}

/** Z2_LOCAL_CONTEXT — 심볼별 컨텍스트 */
export interface Z2LocalContext {
  contextId: string;
  symbol: Symbol;
  generatedAt: ISOTimestamp;
  trigger: ContextTrigger;
  promptVersion: string;
  // LLM 생성 텍스트
  priceActionSummary: string;
  technicalOutlook: string;
  perpMarketInsight: string | null;
  newsSentimentInsight: string | null;
  overallBias: 'bullish' | 'bearish' | 'neutral';
  confidenceLevel: 'high' | 'medium' | 'low';
  suggestedWatchPoints: string[];
  // 메타
  llmModel: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  // 임베딩
  embeddingVector: number[] | null;
}

/** Z2 컨텍스트 히스토리 요약 (목록용) */
export interface Z2ContextHistoryItem {
  contextId: string;
  type: 'global' | 'local';
  symbol: Symbol | null;
  generatedAt: ISOTimestamp;
  trigger: ContextTrigger;
  overallBias?: 'bullish' | 'bearish' | 'neutral';
  promptVersion: string;
  latencyMs: number;
}
