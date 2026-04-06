/**
 * ============================================================================
 * @file        z0.ts
 * @description Z0 Raw Zone 13개 테이블 행 타입을 정의하는 모듈.
 * @zone        Z0
 * @domain      Market | News | Macro
 *
 * @dependencies ./common
 * @called_by   더미 데이터 파일, Z0 컴포넌트
 * @feeds_to    data-table, data-view
 *
 * @strict_rule
 *   1. 300라인 제한 준수.
 *   2. Z0_SPEC.md 스키마와 1:1 대응 유지.
 * ============================================================================
 */
import type { Symbol, Timeframe, ISOTimestamp } from './common';

/** Z0_CANDLE_RAW — OHLCV 캔들 */
export interface Z0CandleRaw {
  symbol: Symbol;
  timeframe: Timeframe;
  openTime: ISOTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  quoteVolume: number;
  tradeCount: number;
  takerBuyBaseVol: number;
  takerBuyQuoteVol: number;
  isClosed: boolean;
  insertedAt: ISOTimestamp;
}

/** Z0_TRADE_RAW — 개별 체결 */
export interface Z0TradeRaw {
  symbol: Symbol;
  tradeId: string;
  price: number;
  qty: number;
  quoteQty: number;
  isBuyerMaker: boolean;
  tradeTime: ISOTimestamp;
  insertedAt: ISOTimestamp;
}

/** Z0_ORDERBOOK_SNAPSHOT — 호가창 스냅샷 */
export interface Z0OrderbookSnapshot {
  symbol: Symbol;
  snapshotTime: ISOTimestamp;
  lastUpdateId: number;
  bids: [number, number][];   // [price, qty][]
  asks: [number, number][];
  insertedAt: ISOTimestamp;
}

/** Z0_FUNDING_RAW — 펀딩비 */
export interface Z0FundingRaw {
  symbol: Symbol;
  fundingTime: ISOTimestamp;
  fundingRate: number;
  markPrice: number;
  insertedAt: ISOTimestamp;
}

/** Z0_OI_RAW — 미결제약정 */
export interface Z0OiRaw {
  symbol: Symbol;
  snapshotTime: ISOTimestamp;
  openInterest: number;
  openInterestValue: number;
  insertedAt: ISOTimestamp;
}

/** Z0_LIQUIDATION_RAW — 청산 */
export interface Z0LiquidationRaw {
  symbol: Symbol;
  orderTime: ISOTimestamp;
  side: 'BUY' | 'SELL';
  price: number;
  qty: number;
  quoteQty: number;
  insertedAt: ISOTimestamp;
}

/** Z0_LS_RATIO_RAW — 롱숏 비율 */
export interface Z0LsRatioRaw {
  symbol: Symbol;
  period: string;
  snapshotTime: ISOTimestamp;
  longShortRatio: number;
  longAccount: number;
  shortAccount: number;
  insertedAt: ISOTimestamp;
}

/** Z0_GLOBAL_METRICS_RAW — CoinGecko 글로벌 지표 */
export interface Z0GlobalMetricsRaw {
  snapshotTime: ISOTimestamp;
  totalMarketCapUsd: number;
  totalVolumeUsd: number;
  btcDominance: number;
  ethDominance: number;
  activeCryptocurrencies: number;
  fearGreedIndex: number | null;
  insertedAt: ISOTimestamp;
}

/** Z0_ECON_RAW — FRED 경제지표 */
export interface Z0EconRaw {
  seriesId: string;           // 'FEDFUNDS', 'DGS10' 등
  observationDate: string;    // 'YYYY-MM-DD'
  value: number;
  unit: string;
  seasonalAdj: boolean;
  fetchedAt: ISOTimestamp;
  insertedAt: ISOTimestamp;
}

/** Z0_NEWS_RAW — RSS 뉴스 */
export interface Z0NewsRaw {
  articleId: string;
  source: string;
  title: string;
  url: string;
  publishedAt: ISOTimestamp;
  contentSnippet: string;
  symbols: Symbol[];
  insertedAt: ISOTimestamp;
}

/** Z0_TRAD_MARKET_RAW — 전통 시장 (Yahoo Finance) */
export interface Z0TradMarketRaw {
  ticker: string;             // 'SPY', 'QQQ', 'DXY' 등
  date: string;               // 'YYYY-MM-DD'
  open: number;
  high: number;
  low: number;
  close: number;
  adjClose: number;
  volume: number;
  insertedAt: ISOTimestamp;
}

/** Z0_SENTIMENT_RAW — 감성 분석 원본 */
export interface Z0SentimentRaw {
  articleId: string;
  symbol: Symbol | null;
  sentimentScore: number;     // -1.0 ~ 1.0
  sentimentLabel: 'positive' | 'neutral' | 'negative';
  confidence: number;
  modelVersion: string;
  analyzedAt: ISOTimestamp;
  insertedAt: ISOTimestamp;
}
