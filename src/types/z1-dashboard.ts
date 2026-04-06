/**
 * ============================================================================
 * @file        z1-dashboard.ts
 * @description Z1 dashboard API response types used by the frontend.
 * @zone        INFRA
 * @domain      System
 *
 * [Architecture Context & Correlation]
 * @dependencies 없음
 * @called_by    lib/api.ts, app/z1/page.tsx, components/z1/*
 * @feeds_to     Z1 feature dashboard rendering
 *
 * @strict_rule
 *   1. 300-line limit.
 *   2. Type definitions only.
 *   3. No business logic.
 * ============================================================================
 */

export interface Z1DashboardMeta {
  symbol: string;
  asOf: string | null;
  zoneStatus: 'LIVE' | 'PARTIAL' | 'OFFLINE';
  activeModules: number;
  totalModules: number;
}

export interface Z1DashboardTech {
  SYMBOL: string;
  TIMEFRAME: string;
  CANDLE_TIME: string;
  CLOSE_PRICE: number;
  PRICE_CHANGE_PCT: number;
  RSI_14: number | null;
  RSI_STATE: string;
  MACD_LINE: number | null;
  MACD_SIGNAL: number | null;
  MACD_HIST: number | null;
  MACD_CROSS: string;
  ATR_14: number | null;
  ATR_RATIO: number;
  ATR_STATE: string;
  EMA_20: number | null;
  EMA_50: number | null;
  EMA_200: number | null;
  EMA_ALIGNMENT: string;
  BB_POSITION: number | null;
  VOLUME_RATIO: number;
  CALCULATED_AT: string;
}

export interface Z1DashboardLevel {
  price?: number;
  type?: string;
  strength?: string;
}

export interface Z1DashboardRegime {
  SYMBOL: string;
  TIMEFRAME: string;
  CANDLE_TIME: string;
  REGIME: string;
  REGIME_SCORE: number;
  TREND_DIRECTION: string;
  TREND_STRENGTH: string;
  VOLATILITY_STATE: string;
  MOMENTUM_STATE: string;
  SUPPORT_LEVELS: Z1DashboardLevel[];
  RESISTANCE_LEVELS: Z1DashboardLevel[];
  REGIME_FACTORS: Record<string, unknown>;
  CALCULATED_AT: string;
}

export interface Z1DashboardPerp {
  SYMBOL: string;
  BUCKET_TIME: string;
  FUNDING_RATE: number | null;
  FUNDING_8H_AVG: number | null;
  FUNDING_STATE: string;
  OI_VALUE: number | null;
  OI_CHANGE_4H: number | null;
  OI_CHANGE_1D: number | null;
  OI_PRICE_DIVERGENCE: string;
  LIQUIDATION_LONG_SUM: number | null;
  LIQUIDATION_SHORT_SUM: number | null;
  LIQUIDATION_IMBALANCE: number | null;
  LS_RATIO_TOP: number | null;
  LS_RATIO_GLOBAL: number | null;
  LS_DIVERGENCE: string;
  SUPPLY_PRESSURE: string;
  CALCULATED_AT: string;
}

export interface Z1DashboardMacro {
  SNAPSHOT_DATE: string;
  YIELD_CURVE_STATE: string;
  DXY_VALUE: number | null;
  DXY_CHANGE_1W: number | null;
  DXY_STATE: string;
  VIX_VALUE: number | null;
  VIX_STATE: string;
  LIQUIDITY_STATE: string;
  BTC_DOMINANCE: number | null;
  BTC_DOM_CHANGE_1W: number | null;
  STABLECOIN_MCAP_CHANGE_1W: number | null;
  STABLECOIN_FLOW_STATE: string | null;
  LATEST_EVENT_NAME: string | null;
  NEXT_EVENT_NAME: string | null;
  NEXT_EVENT_DATE: string | null;
  DAYS_TO_NEXT_EVENT: number | null;
  MACRO_REGIME: string;
  CALCULATED_AT: string;
}

export interface Z1DashboardNewsItem {
  ARTICLE_ID: string;
  SYMBOL: string | null;
  CHUNK_TEXT: string;
  SENTIMENT_SCORE: number;
  SENTIMENT_LABEL: string;
  KEY_TOPICS: string[];
  RELEVANCE_SCORE: number | null;
  PUBLISHED_AT: string;
  CALCULATED_AT: string;
}

export interface Z1DashboardNews {
  averageSentiment: number | null;
  dominantLabel: string | null;
  topTopics: string[];
  items: Z1DashboardNewsItem[];
}

export interface Z1DashboardCorrelation {
  FROM_SYMBOL: string;
  TO_SYMBOL: string;
  EDGE_TYPE: string;
  LOOKBACK_DAYS: number;
  CALC_DATE: string;
  CORRELATION: number;
  CONFIDENCE: number | null;
  DATA_POINTS: number;
  CALCULATED_AT: string;
  PEER_SYMBOL: string;
}

export interface Z1DashboardModule {
  componentId: string;
  label: string;
  status: 'UP' | 'DOWN' | 'DEGRADED' | 'UNKNOWN';
  lastHeartbeat: string | null;
  rowsProcessed: number | null;
  recentRows: number | null;
  avgLatencyMs: number | null;
}

export interface Z1DashboardResponse {
  meta: Z1DashboardMeta;
  btc: {
    regime1d: Z1DashboardRegime | null;
    regime4h: Z1DashboardRegime | null;
    tech1d: Z1DashboardTech | null;
    tech4h: Z1DashboardTech | null;
    perp: Z1DashboardPerp | null;
  };
  macro: Z1DashboardMacro | null;
  news: Z1DashboardNews;
  correlation: Z1DashboardCorrelation[];
  modules: Z1DashboardModule[];
}
