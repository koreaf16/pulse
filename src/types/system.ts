/**
 * ============================================================================
 * @file        system.ts
 * @description SYS 메타 테이블 타입 — 데이터 소스 동적 관리 체계를 정의한다.
 * @zone        INFRA
 * @domain      System
 *
 * @dependencies ./common
 * @called_by   더미 데이터 파일, Z0 컴포넌트
 * @feeds_to    source-list-row, source-domain-section
 *
 * @strict_rule
 *   1. 300라인 제한 준수.
 *   2. SYS 테이블 스키마와 1:1 대응 유지.
 * ============================================================================
 */
import type { ProviderType, RunStatus, ISOTimestamp, ComponentStatus, ComponentType } from './common';

/** SYS_DATA_SOURCE 테이블 행 */
export interface SysDataSource {
  sourceId: string;            // UUID
  sourceName: string;          // 'Binance BTC/USDT Candle'
  providerType: ProviderType;
  endpoint: string;            // URL or API base
  isActive: boolean;
  runStatus: RunStatus;
  lastSuccessAt: ISOTimestamp | null;
  lastErrorAt: ISOTimestamp | null;
  lastErrorMsg: string | null;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
  config: Record<string, unknown>;  // JSON 설정 (symbol, interval 등)
}

/** SYS_COLLECTION_LOG 테이블 행 */
export interface SysCollectionLog {
  logId: string;
  sourceId: string;
  collectedAt: ISOTimestamp;
  rowsInserted: number;
  durationMs: number;
  status: 'ok' | 'error';
  errorMsg: string | null;
}

/** SYS_PIPELINE_EVENT 테이블 행 */
export interface SysPipelineEvent {
  eventId: string;
  eventType: string;           // 'candle_closed', 'funding_updated' 등
  zone: 'Z0' | 'Z1' | 'Z2';
  symbol: string | null;
  timeframe: string | null;
  payload: Record<string, unknown>;
  emittedAt: ISOTimestamp;
  processedAt: ISOTimestamp | null;
}

/** SYS_PIPELINE_HEARTBEAT 행 (헬스 모니터링) */
export interface SysHeartbeat {
  componentId: string;
  componentType: ComponentType;
  status: ComponentStatus;
  lastHeartbeat: ISOTimestamp;
  metrics: {
    rowsProcessed?: number;
    totalRows?: number;
    recentRows?: number;
    errorsLast1h?: number;
    avgLatencyMs?: number;
  };
  uptimeSec: number;
}

/** 전체 헬스 요약 */
export interface HealthSummary {
  overallStatus: ComponentStatus;
  components: SysHeartbeat[];
  totalUp: number;
  totalDown: number;
  totalDegraded: number;
  totalUnknown: number;
  checkedAt: ISOTimestamp;
}

/** SYS_DATA_QUALITY 행 */
export interface SysDataQuality {
  qualityId: number;
  sourceId: string;
  domain: string;
  severity: 'WARN' | 'REJECT';
  fieldName: string;
  ruleName: string;
  message: string | null;
  actualValue: string | null;
  recordedAt: ISOTimestamp;
}
