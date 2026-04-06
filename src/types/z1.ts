/**
 * ============================================================================
 * @file        z1.ts
 * @description Z1 Feature Zone DB 테이블 행 타입을 정의하는 모듈.
 * @zone        Z1
 * @domain      Market | Macro | News
 *
 * @dependencies 없음
 * @called_by   Z1 데이터 탐색기, Z1 페이지
 * @feeds_to    DataTable, Z1 컴포넌트
 *
 * @strict_rule
 *   1. 300라인 제한 준수.
 *   2. backend/sql/12-z1-feature.sql 스키마와 1:1 대응 유지.
 *   3. 필드 키는 UPPER_CASE (Oracle OUT_FORMAT_OBJECT 반환값).
 * ============================================================================
 */

/** Z1_TECH_INDICATOR — 기술적 지표 (RSI, MACD, EMA, ATR, BB, Volume) */
export interface Z1TechIndicatorRow {
  SYMBOL: string;
  TIMEFRAME: string;
  CANDLE_TIME: string;
  CLOSE_PRICE: number;
  PRICE_CHANGE_PCT: number | null;
  RANGE_PCT: number | null;
  BODY_RATIO: number | null;
  VOLUME: number | null;
  // RSI (14)
  RSI_14: number | null;
  RSI_STATE: string | null;
  // MACD (12, 26, 9)
  MACD_LINE: number | null;
  MACD_SIGNAL: number | null;
  MACD_HIST: number | null;
  MACD_CROSS: string | null;
  // ATR (14)
  ATR_14: number | null;
  ATR_20D_AVG: number | null;
  ATR_RATIO: number | null;
  ATR_STATE: string | null;
  // EMA (20, 50, 200)
  EMA_20: number | null;
  EMA_50: number | null;
  EMA_200: number | null;
  EMA_ALIGNMENT: string | null;
  // Bollinger Bands (20, 2)
  BB_UPPER: number | null;
  BB_MIDDLE: number | null;
  BB_LOWER: number | null;
  BB_WIDTH: number | null;
  BB_POSITION: number | null;
  // Volume
  VOLUME_SMA_20: number | null;
  VOLUME_RATIO: number | null;
  SOURCE: string;
  CALCULATED_AT: string;
}

/** Z1_PERP_METRIC — 선물 수급 종합 (4h 단위 집계) */
export interface Z1PerpMetricRow {
  SYMBOL: string;
  BUCKET_TIME: string;
  FUNDING_RATE: number | null;
  FUNDING_8H_AVG: number | null;
  FUNDING_STATE: string | null;
  OI_VALUE: number | null;
  OI_CHANGE_4H: number | null;
  OI_CHANGE_1D: number | null;
  OI_PRICE_DIVERGENCE: string | null;
  LIQUIDATION_LONG_SUM: number | null;
  LIQUIDATION_SHORT_SUM: number | null;
  LIQUIDATION_IMBALANCE: number | null;
  LS_RATIO_TOP: number | null;
  LS_RATIO_GLOBAL: number | null;
  LS_DIVERGENCE: string | null;
  SUPPLY_PRESSURE: string | null;
  CALCULATED_AT: string;
}

/** Z1_MACRO_SNAPSHOT — 거시경제 스냅샷 (1일 단위) */
export interface Z1MacroSnapshotRow {
  SNAPSHOT_DATE: string;
  US10Y_YIELD: number | null;
  US2Y_YIELD: number | null;
  YIELD_SPREAD: number | null;
  YIELD_CURVE_STATE: string | null;
  FED_FUNDS_RATE: number | null;
  DXY_VALUE: number | null;
  DXY_CHANGE_1W: number | null;
  DXY_STATE: string | null;
  VIX_VALUE: number | null;
  VIX_STATE: string | null;
  GOLD_VALUE: number | null;
  SPX_CHANGE_1W: number | null;
  M2_CHANGE_3M: number | null;
  LIQUIDITY_STATE: string | null;
  BTC_DOMINANCE: number | null;
  BTC_DOM_CHANGE_1W: number | null;
  STABLECOIN_MCAP_CHANGE_1W: number | null;
  STABLECOIN_FLOW_STATE: string | null;
  LATEST_EVENT_NAME: string | null;
  LATEST_EVENT_SURPRISE: number | null;
  NEXT_EVENT_NAME: string | null;
  NEXT_EVENT_DATE: string | null;
  DAYS_TO_NEXT_EVENT: number | null;
  MACRO_REGIME: string | null;
  CALCULATED_AT: string;
}

/** Z1_NEWS_EMBEDDING — 뉴스 벡터 + 감성 (EMBEDDING 컬럼은 API에서 제외) */
export interface Z1NewsEmbeddingRow {
  EMBEDDING_ID: string;
  ARTICLE_ID: string;
  SYMBOL: string | null;
  CHUNK_TEXT: string | null;
  SENTIMENT_SCORE: number | null;
  SENTIMENT_LABEL: string | null;
  KEY_TOPICS: string | null;
  RELEVANCE_SCORE: number | null;
  PUBLISHED_AT: string;
  CALCULATED_AT: string;
}

/** Z1_MARKET_REGIME — 기술적 국면 분류 */
export interface Z1MarketRegimeRow {
  SYMBOL: string;
  TIMEFRAME: string;
  CANDLE_TIME: string;
  REGIME: string;
  REGIME_SCORE: number | null;
  TREND_DIRECTION: string | null;
  TREND_STRENGTH: string | null;
  VOLATILITY_STATE: string | null;
  MOMENTUM_STATE: string | null;
  SUPPORT_LEVELS: string | null;
  RESISTANCE_LEVELS: string | null;
  REGIME_FACTORS: string | null;
  CALCULATED_AT: string;
}

/** Z1_ASSET_CORR — 자산 간 Pearson 상관계수 (크립토 vs 전통자산) */
export interface Z1AssetCorrRow {
  FROM_SYMBOL: string;
  TO_SYMBOL: string;
  LOOKBACK_DAYS: number;
  CALC_DATE: string;
  CORRELATION: number | null;
  CONFIDENCE: number | null;
  DATA_POINTS: number | null;
  CALCULATED_AT: string;
}
