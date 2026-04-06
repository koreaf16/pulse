/**
 * ============================================================================
 * @file        events.ts
 * @description 파이프라인 이벤트 페이로드 인터페이스를 정의하는 모듈.
 * @zone        INFRA
 * @domain      System
 *
 * @dependencies ./common
 * @called_by   더미 데이터 파일, event-timeline
 * @feeds_to    pipeline/event-timeline
 *
 * @strict_rule
 *   1. 300라인 제한 준수.
 *   2. Z0_SPEC.md 이벤트 인터페이스 테이블과 동기화 유지.
 * ============================================================================
 */
import type { Symbol, Timeframe, Zone, ISOTimestamp } from './common';

/** 기본 이벤트 구조 */
export interface BaseEvent {
  eventId: string;
  eventType: string;
  zone: Zone;
  emittedAt: ISOTimestamp;
}

/** candle_closed 이벤트 */
export interface CandleClosedEvent extends BaseEvent {
  eventType: 'candle_closed';
  zone: 'Z0';
  symbol: Symbol;
  timeframe: Timeframe;
  closePrice: number;
  closeTime: ISOTimestamp;
}

/** funding_updated 이벤트 */
export interface FundingUpdatedEvent extends BaseEvent {
  eventType: 'funding_updated';
  zone: 'Z0';
  symbol: Symbol;
  fundingRate: number;
  fundingTime: ISOTimestamp;
}

/** news_arrived 이벤트 */
export interface NewsArrivedEvent extends BaseEvent {
  eventType: 'news_arrived';
  zone: 'Z0';
  articleId: string;
  source: string;
  symbols: Symbol[];
}

/** econ_data_updated 이벤트 */
export interface EconDataUpdatedEvent extends BaseEvent {
  eventType: 'econ_data_updated';
  zone: 'Z0';
  seriesId: string;
  observationDate: string;
}

/** z1_feature_ready 이벤트 */
export interface Z1FeatureReadyEvent extends BaseEvent {
  eventType: 'z1_feature_ready';
  zone: 'Z1';
  symbol: Symbol | null;
  featureType: string;
  calculatedAt: ISOTimestamp;
}

/** z2_context_generated 이벤트 */
export interface Z2ContextGeneratedEvent extends BaseEvent {
  eventType: 'z2_context_generated';
  zone: 'Z2';
  contextId: string;
  symbol: Symbol | null;
  trigger: string;
}

/** 표시용 이벤트 유니온 타입 */
export type PipelineEvent =
  | CandleClosedEvent
  | FundingUpdatedEvent
  | NewsArrivedEvent
  | EconDataUpdatedEvent
  | Z1FeatureReadyEvent
  | Z2ContextGeneratedEvent;
