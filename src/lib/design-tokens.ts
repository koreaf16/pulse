import type { ComponentStatus, RunStatus, Zone } from '@/types/common';

import type { ProviderType } from '@/types/common';

export const ZONE_COLORS: Record<Zone, { primary: string; light: string; border: string }> = {
  Z0: { primary: '#0984E3', light: '#EBF5FF', border: 'border-l-[#0984E3]' },
  Z1: { primary: '#00B894', light: '#E8FBF6', border: 'border-l-[#00B894]' },
  Z2: { primary: '#6C5CE7', light: '#F0EEFF', border: 'border-l-[#6C5CE7]' },
};

export const STATUS_STYLES: Record<RunStatus, { label: string; dot: string; badge: string; text: string }> = {
  running: { label: '수집 중', dot: 'bg-[#00B894]', badge: 'bg-[#E8FBF6]', text: 'text-[#00B894]' },
  error: { label: '오류', dot: 'bg-[#D63031]', badge: 'bg-[#FFEAEA]', text: 'text-[#D63031]' },
  cooldown: { label: '지연', dot: 'bg-[#FDCB6E]', badge: 'bg-[#FFF8E6]', text: 'text-[#E17055]' },
  stopped: { label: '중지', dot: 'bg-[#B2BEC3]', badge: 'bg-[#F5F6FA]', text: 'text-[#636E72]' },
};

export const HEALTH_STYLES: Record<ComponentStatus, { label: string; dot: string; badge: string; text: string }> = {
  UP: { label: '정상', dot: 'bg-[#00B894]', badge: 'bg-[#E8FBF6]', text: 'text-[#00B894]' },
  DOWN: { label: '중단', dot: 'bg-[#D63031]', badge: 'bg-[#FFEAEA]', text: 'text-[#D63031]' },
  DEGRADED: { label: '성능 저하', dot: 'bg-[#FDCB6E]', badge: 'bg-[#FFF8E6]', text: 'text-[#E17055]' },
  UNKNOWN: { label: '미확인', dot: 'bg-[#B2BEC3]', badge: 'bg-[#F5F6FA]', text: 'text-[#636E72]' },
};

export interface NavItem {
  label: string;
  href: string;
  zone: Zone | null;
  description: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: '개요', href: '/', zone: null, description: '파이프라인 대시보드' },
  { label: 'Z0 수집', href: '/z0', zone: 'Z0', description: '원천 데이터 수집기' },
  { label: 'Z1 피처', href: '/z1', zone: 'Z1', description: '파생 지표 처리' },
  { label: 'Z2 컨텍스트', href: '/z2', zone: 'Z2', description: '컨텍스트 생성' },
  { label: '시스템', href: '/system', zone: null, description: '헬스와 알림' },
];

export const Z0_TABLE_NAMES = [
  'candle_raw',
  'trade_raw',
  'orderbook_snapshot',
  'funding_raw',
  'oi_raw',
  'liquidation_raw',
  'ls_ratio_raw',
  'global_metrics_raw',
  'econ_raw',
  'news_raw',
  'trad_market_raw',
  'sentiment_raw',
] as const;

export type Z0TableName = (typeof Z0_TABLE_NAMES)[number];

export const Z1_TABLE_NAMES = [
  'tech_indicator',
  'perp_metric',
  'macro_snapshot',
  'news_embedding',
  'market_regime',
] as const;

export type Z1TableName = (typeof Z1_TABLE_NAMES)[number];

export const PROVIDER_LABELS: Record<string, string> = {
  binance: 'Binance',
  fred: 'FRED',
  coingecko: 'CoinGecko',
  rss: 'RSS 피드',
  yahoo: 'Yahoo Finance',
  cryptoquant: 'CryptoQuant',
  coinglass: 'CoinGlass',
};

export const PROVIDER_COLORS: Record<string, string> = {
  binance: '#F0B90B',
  fred: '#1B4F72',
  coingecko: '#8DC647',
  rss: '#FF6600',
  yahoo: '#6001D2',
  cryptoquant: '#06B6D4',
  coinglass: '#EC4899',
};

export type SourceSectionKey = 'market' | 'macro' | 'news' | 'onchain' | 'other';

export const SOURCE_SECTION_ORDER: SourceSectionKey[] = [
  'market',
  'macro',
  'news',
  'onchain',
  'other',
];

export const SOURCE_SECTION_LABELS: Record<SourceSectionKey, string> = {
  market: '시장',
  macro: '거시경제',
  news: '뉴스',
  onchain: '온체인',
  other: '기타',
};

export const SOURCE_SECTION_COLORS: Record<SourceSectionKey, { accent: string; soft: string }> = {
  market: { accent: '#0984E3', soft: '#EBF5FF' },
  macro: { accent: '#1B4F72', soft: '#EEF3F7' },
  news: { accent: '#FF6600', soft: '#FFF3E8' },
  onchain: { accent: '#06B6D4', soft: '#E8FCFF' },
  other: { accent: '#636E72', soft: '#F5F6FA' },
};

export const PROVIDER_SECTION_MAP: Record<ProviderType, SourceSectionKey> = {
  binance: 'market',
  fred: 'macro',
  coingecko: 'market',
  rss: 'news',
  yahoo: 'market',
  cryptoquant: 'onchain',
  coinglass: 'market',
};
