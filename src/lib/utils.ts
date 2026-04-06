/**
 * ============================================================================
 * @file        utils.ts
 * @description 공통 유틸리티 함수 모음 — className 병합, 시간 포맷 등.
 * @zone        INFRA
 * @domain      System
 *
 * @dependencies clsx, tailwind-merge
 * @called_by   모든 컴포넌트
 * @feeds_to    -
 *
 * @strict_rule
 *   1. 300라인 제한 준수.
 *   2. 순수 함수만 포함. 상태/사이드이펙트 금지.
 * ============================================================================
 */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Tailwind className 병합 유틸리티 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * UTC ISO 타임스탬프를 US Eastern Time 문자열로 변환.
 * 서버사이드/클라이언트사이드 모두 Intl API 사용.
 */
export function toETString(
  iso: string,
  opts: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZoneName: 'short',
  }
): string {
  return new Intl.DateTimeFormat('en-US', {
    ...opts,
    timeZone: 'America/New_York',
  }).format(new Date(iso));
}

const SIGNAL_LABELS: Record<string, string> = {
  LIVE: '정상',
  PARTIAL: '부분 동작',
  OFFLINE: '중단',
  PENDING: '대기 중',
  WAITING: '대기 중',
  STRONG_UPTREND: '강한 상승',
  UPTREND: '상승',
  RANGE_BOUND: '박스권',
  DOWNTREND: '하락',
  STRONG_DOWNTREND: '강한 하락',
  HIGH_VOLATILITY: '고변동성',
  RISK_ON: '위험 선호',
  RISK_OFF: '위험 회피',
  NEUTRAL: '중립',
  BULLISH: '강세',
  BEARISH: '약세',
  VERY_BULLISH: '매우 강세',
  VERY_BEARISH: '매우 약세',
  STRONGLY_BULLISH: '매우 강세',
  STRONGLY_BEARISH: '매우 약세',
  STRONG_LONG: '롱 과열',
  LONG: '롱 우위',
  SHORT: '숏 우위',
  STRONG_SHORT: '숏 과열',
  CONFIRMING: '추세 확인',
  DIVERGING: '괴리',
  ALIGNED: '정렬',
  EXPANDING: '확장',
  STABLE: '안정',
  CONTRACTING: '축소',
  INFLOW: '유입',
  OUTFLOW: '유출',
  INVERTED: '역전',
  FLAT: '평탄',
  NORMAL: '정상',
  LOW: '낮음',
  HIGH: '높음',
  EXTREME: '극단',
  OVERSOLD: '과매도',
  OVERBOUGHT: '과매수',
  GOLDEN: '골든크로스',
  DEAD: '데드크로스',
  NONE: '없음',
  MIXED: '혼조',
  UP: '상승',
  DOWN: '하락',
  UNKNOWN: '미확인',
  CORRELATION: '상관관계',
  INFLUENCE: '영향',
  SECTOR_PEER: '동종 자산',
  REGULAR: '정기 실행',
  URGENT: '긴급 실행',
};

export function translateSignalLabel(value: string | null | undefined): string {
  if (!value) return '없음';
  return SIGNAL_LABELS[value] ?? value;
}

/** 시간만 표시 (HH:MM ET) */
export function toETTimeOnly(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'America/New_York',
  }).format(new Date(iso)) + ' ET';
}

/** 날짜만 표시 (MMM DD) */
export function toETDateOnly(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    timeZone: 'America/New_York',
  }).format(new Date(iso));
}

/** 숫자를 K/M/B 단위로 포맷 */
export function formatCompact(n: number): string {
  if (Math.abs(n) >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + 'B';
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M';
  if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(2) + 'K';
  return n.toFixed(2);
}

/** 퍼센트 포맷 (소수점 4자리) */
export function formatPercent(n: number, decimals = 4): string {
  return (n * 100).toFixed(decimals) + '%';
}

/** 가격 포맷 (심볼에 따라 소수점 조정) */
export function formatPrice(price: number, symbol?: string): string {
  const decimals = symbol?.startsWith('BTC') ? 2 : 4;
  return price.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** 경과 시간 (상대 표시) */
export function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diffMs)) return '-';
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `${Math.max(diffSec, 0)}초 전`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;
  return `${Math.floor(diffHour / 24)}일 전`;
}
