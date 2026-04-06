/**
 * ============================================================================
 * @file        common.ts
 * @description 전 Zone 공통 열거형 및 기본 타입을 정의하는 모듈.
 * @zone        INFRA
 * @domain      System
 *
 * @dependencies 없음
 * @called_by   z0.ts, z1.ts, z2.ts, system.ts
 * @feeds_to    모든 컴포넌트 및 더미 데이터 파일
 *
 * @strict_rule
 *   1. 300라인 제한 준수.
 *   2. 비즈니스 로직 포함 금지.
 * ============================================================================
 */

/** 지원 심볼 */
export type Symbol =
  | 'BTCUSDT'
  | 'ETHUSDT'
  | 'SOLUSDT'
  | 'BNBUSDT'
  | 'ADAUSDT';

/** 캔들 타임프레임 */
export type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w';

/** Zone 구분 */
export type Zone = 'Z0' | 'Z1' | 'Z2';

/** 소스/수집기 운영 상태 */
export type RunStatus = 'running' | 'stopped' | 'error' | 'cooldown';

/** 소스 프로바이더 종류 */
export type ProviderType =
  | 'binance'
  | 'fred'
  | 'coingecko'
  | 'rss'
  | 'yahoo'
  | 'cryptoquant'
  | 'coinglass';

/** 날짜/시간 문자열 (ISO 8601, UTC) */
export type ISOTimestamp = string;

/** US Eastern Time 표시용 문자열 */
export type ETTimeString = string;

/** 페이지네이션 파라미터 */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

/** 페이지네이션 결과 메타 */
export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** 파이프라인 구성요소 상태 (헬스 모니터링) */
export type ComponentStatus = 'UP' | 'DOWN' | 'DEGRADED' | 'UNKNOWN';

/** 파이프라인 구성요소 유형 */
export type ComponentType = 'collector' | 'feature-engine' | 'context-builder' | 'infrastructure';
