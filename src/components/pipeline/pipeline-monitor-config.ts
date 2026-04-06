/**
 * ============================================================================
 * @file        pipeline-monitor-config.ts
 * @description Pipeline monitor 테이블 정의와 메트릭 조합 유틸을 제공하는 모듈.
 * @zone        INFRA
 * @domain      System
 *
 * [Architecture Context & Correlation]
 * @dependencies @/lib/api, ./pipeline-zone-node
 * @called_by   components/pipeline/pipeline-live-view.tsx
 * @feeds_to    -
 *
 * @strict_rule
 *   1. 300라인 제한 준수.
 *   2. UI 설정과 메트릭 계산만 포함.
 *   3. 데이터 조회는 호출한 컴포넌트에서 수행.
 * ============================================================================
 */
import type { ComponentHealth, TableSizeSummaryRow } from '@/lib/api';
import type { TargetTable } from './pipeline-zone-node';

export type TableMetricMap = Record<string, { generatedRows?: number; storedRows?: number }>;

export const Z0_FEATURE_SOURCES: TargetTable[] = [
  { label: '가격 캔들 데이터 (Z0)', color: '#3B82F6', id: 'Z0_PRICE_CANDLE' },
  { label: '선물 펀딩비 (Z0)', color: '#06B6D4', id: 'Z0_PERP_FUNDING' },
  { label: '미결제약정 (Z0)', color: '#0EA5E9', id: 'Z0_PERP_OI' },
  { label: '강제청산 내역 (Z0)', color: '#2563EB', id: 'Z0_PERP_LIQUIDATION' },
  { label: '롱숏 비율 (Z0)', color: '#38BDF8', id: 'Z0_PERP_LS_RATIO' },
  { label: '경제 시계열 (Z0)', color: '#F59E0B', id: 'Z0_ECON_TIMESERIES' },
  { label: '글로벌 마켓 정보 (Z0)', color: '#22C55E', id: 'Z0_CRYPTO_GLOBAL' },
  { label: '전통 자산 데이터 (Z0)', color: '#EF4444', id: 'Z0_TRAD_MARKET' },
  { label: '뉴스 피드 (Z0)', color: '#8B5CF6', id: 'Z0_NEWS_FEED' },
];

export const Z0_RAW_TARGETS: TargetTable[] = [
  { label: '가격 캔들 (Z0)', color: '#3B82F6', id: 'Z0_PRICE_CANDLE' },
  { label: '강제청산 (Z0)', color: '#2563EB', id: 'Z0_PERP_LIQUIDATION' },
  { label: '선물 펀딩비 (Z0)', color: '#06B6D4', id: 'Z0_PERP_FUNDING' },
  { label: '미결제약정 (Z0)', color: '#0EA5E9', id: 'Z0_PERP_OI' },
  { label: '롱숏 비율 (Z0)', color: '#38BDF8', id: 'Z0_PERP_LS_RATIO' },
  { label: '지갑 잔고 (Z0)', color: '#14B8A6', id: 'Z0_MY_BALANCE' },
  { label: '보유 포지션 (Z0)', color: '#0F766E', id: 'Z0_MY_POSITION' },
  { label: '경제 지표 (Z0)', color: '#F59E0B', id: 'Z0_ECON_TIMESERIES' },
  { label: '마켓 캡 (Z0)', color: '#22C55E', id: 'Z0_CRYPTO_GLOBAL' },
  { label: '뉴스 (Z0)', color: '#8B5CF6', id: 'Z0_NEWS_FEED' },
  { label: '전통 자산 (Z0)', color: '#EF4444', id: 'Z0_TRAD_MARKET' },
  { label: '소셜 메시지 (Z0)', color: '#25D366', id: 'Z0_SOCIAL_MESSAGE' },
];

export const Z1_TARGETS: TargetTable[] = [
  { label: '기술적 분석 지표 (Z1)', color: '#7C3AED', id: 'Z1_TECH_INDICATOR' },
  { label: '선물 수급 지표 (Z1)', color: '#8B5CF6', id: 'Z1_PERP_METRIC' },
  { label: '매크로 환경 분석 (Z1)', color: '#A78BFA', id: 'Z1_MACRO_SNAPSHOT' },
  { label: '뉴스 감성 임베딩 (Z1)', color: '#C4B5FD', id: 'Z1_NEWS_EMBEDDING' },
  { label: '소셜 감성 분석 (Z1)', color: '#10B981', id: 'Z1_SOCIAL_SENTIMENT' },
];

export const Z2_TARGETS: TargetTable[] = [
  { label: '심볼별 로컬 문맥 (Z2)', color: '#F472B6', id: 'Z2_LOCAL_CONTEXT' },
  { label: '시장 전체 글로벌 문맥 (Z2)', color: '#DB2777', id: 'Z2_GLOBAL_CONTEXT' },
  { label: '문맥 벡터 데이터 (Z2)', color: '#F9A8D4', id: 'Z2_CONTEXT_EMBEDDING' },
];

export const TABLE_PRODUCERS: Record<string, string[]> = {
  Z0_PRICE_CANDLE: ['binance-ws-kline'],
  Z0_PERP_LIQUIDATION: ['binance-ws-liquidation', 'bybit-liquidation', 'okx-liquidation'],
  Z0_PERP_FUNDING: ['binance-rest-funding'],
  Z0_PERP_OI: ['binance-rest-oi', 'coinglass'],
  Z0_PERP_LS_RATIO: ['binance-rest-ls-ratio', 'coinglass'],
  Z0_MY_BALANCE: ['binance-rest-balance'],
  Z0_MY_POSITION: ['binance-rest-position'],
  Z0_ECON_TIMESERIES: ['fred-timeseries'],
  Z0_CRYPTO_GLOBAL: ['coingecko-global', 'cryptoquant'],
  Z0_NEWS_FEED: ['rss-news', 'coingecko-news'],
  Z0_TRAD_MARKET: ['yahoo-trad'],
  Z0_SOCIAL_MESSAGE: ['telegram-channel'],
  Z1_TECH_INDICATOR: ['z1-indicator-service'],
  Z1_PERP_METRIC: ['z1-perp-service'],
  Z1_MACRO_SNAPSHOT: ['z1-macro-service'],
  Z1_NEWS_EMBEDDING: ['z1-news-service'],
  Z1_SOCIAL_SENTIMENT: ['z1-social-service'],
  Z2_LOCAL_CONTEXT: ['z2-pipeline'],
  Z2_GLOBAL_CONTEXT: ['z2-pipeline'],
  Z2_CONTEXT_EMBEDDING: ['z2-pipeline'],
};

const PROVIDER_COLORS: Record<string, string> = {
  binance: '#3B82F6',
  fred: '#F59E0B',
  coingecko: '#22C55E',
  yahoo: '#EF4444',
  rss: '#8B5CF6',
  cryptoquant: '#06B6D4',
  coinglass: '#EC4899',
  telegram: '#26A5E4',
  bybit: '#F7A600',
  okx: '#000000',
};

export function getSourceColor(sourceId: string): string {
  if (sourceId.startsWith('binance')) return PROVIDER_COLORS.binance;
  if (sourceId.startsWith('fred')) return PROVIDER_COLORS.fred;
  if (sourceId.startsWith('coingecko')) return PROVIDER_COLORS.coingecko;
  if (sourceId.startsWith('yahoo')) return PROVIDER_COLORS.yahoo;
  if (sourceId.startsWith('rss')) return PROVIDER_COLORS.rss;
  if (sourceId.startsWith('cryptoquant')) return PROVIDER_COLORS.cryptoquant;
  if (sourceId.startsWith('coinglass')) return PROVIDER_COLORS.coinglass;
  if (sourceId.startsWith('telegram')) return PROVIDER_COLORS.telegram;
  if (sourceId.startsWith('bybit')) return PROVIDER_COLORS.bybit;
  if (sourceId.startsWith('okx')) return PROVIDER_COLORS.okx;
  return '#6B7280';
}

export function resolveZ0Targets(sourceId: string): string[] {
  if (sourceId === 'binance-ws-kline') return ['Z0_PRICE_CANDLE'];
  if (sourceId.includes('liquidation')) return ['Z0_PERP_LIQUIDATION'];
  if (sourceId === 'binance-rest-funding') return ['Z0_PERP_FUNDING'];
  if (sourceId === 'binance-rest-oi') return ['Z0_PERP_OI'];
  if (sourceId === 'binance-rest-ls-ratio') return ['Z0_PERP_LS_RATIO'];
  if (sourceId === 'binance-rest-balance') return ['Z0_MY_BALANCE'];
  if (sourceId === 'binance-rest-position') return ['Z0_MY_POSITION'];
  if (sourceId === 'fred-timeseries') return ['Z0_ECON_TIMESERIES'];
  if (sourceId === 'coingecko-global' || sourceId === 'cryptoquant') return ['Z0_CRYPTO_GLOBAL'];
  if (sourceId === 'rss-news' || sourceId === 'coingecko-news') return ['Z0_NEWS_FEED'];
  if (sourceId === 'yahoo-trad') return ['Z0_TRAD_MARKET'];
  if (sourceId === 'coinglass') return ['Z0_PERP_OI', 'Z0_PERP_LS_RATIO'];
  if (sourceId === 'telegram-channel') return ['Z0_SOCIAL_MESSAGE'];
  return [];
}

export function buildStoredMap(
  z0Rows: TableSizeSummaryRow[],
  z1Rows: TableSizeSummaryRow[],
  z2Rows: TableSizeSummaryRow[],
): Map<string, number> {
  const stored = new Map<string, number>();

  for (const row of [...z0Rows, ...z1Rows]) {
    if (row.TABLE_NAME) stored.set(row.TABLE_NAME, row.TOTAL_ROWS ?? 0);
  }

  for (const row of z2Rows) {
    if (row.table) stored.set(row.table, row.totalRows ?? 0);
  }

  return stored;
}

export function sumRecentRows(health: ComponentHealth[], componentIds: string[]): number {
  return componentIds.reduce((total, componentId) => {
    const component = health.find((entry) => entry.componentId === componentId);
    return total + (component?.metrics?.recentRows ?? 0);
  }, 0);
}

export function applyMetrics(targets: TargetTable[], metrics: TableMetricMap): TargetTable[] {
  return targets.map((target) => ({ ...target, ...metrics[target.id || target.label] }));
}
