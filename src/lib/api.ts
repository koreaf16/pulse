/**
 * ============================================================================
 * @file        api.ts
 * @description 백엔드 REST API fetch 유틸리티 — 수집기 상태 및 헬스 데이터 조회.
 * @zone        INFRA
 * @domain      System
 *
 * @dependencies @/types/system
 * @called_by   components/pipeline/pipeline-source-fan.tsx
 * @feeds_to    -
 *
 * @strict_rule
 *   1. 300라인 제한 준수.
 *   2. 에러 시 빈 배열/null 반환 — 수집기 실패가 UI를 깨면 안 됨.
 *   3. 직접 process.env 사용 금지 — NEXT_PUBLIC_ prefix 환경변수만 허용.
 * ============================================================================
 */

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:2001';

/** /collectors 응답 타입 */
export interface CollectorStatus {
  sourceId: string;
  label:    string;
  running:  boolean;
  totalRows?: number;
}

/** /health/components 응답 타입 */
export interface ComponentHealth {
  componentId:   string;
  componentType: string;
  status:        'UP' | 'DOWN' | 'DEGRADED' | 'UNKNOWN';
  lastHeartbeat: string;
  metrics: {
    rowsProcessed?: number;
    totalRows?:     number;
    recentRows?:    number;
    errorsLast1h?:  number;
    avgLatencyMs?:  number;
  };
  uptimeSec: number;
}

export interface TableSizeSummaryRow {
  TABLE_NAME?: string;
  PARTITION_COUNT?: number;
  TOTAL_BYTES?: number;
  TOTAL_ROWS?: number;
  table?: string;
  totalRows?: number;
  partitions?: number;
}

export async function fetchCollectors(): Promise<CollectorStatus[]> {
  try {
    const res = await fetch(`${API_BASE}/collectors`, { cache: 'no-store' });
    if (!res.ok) return [];
    return (await res.json()) as CollectorStatus[];
  } catch {
    return [];
  }
}

export async function fetchHealthComponents(): Promise<ComponentHealth[]> {
  try {
    const res = await fetch(`${API_BASE}/health/components`, { cache: 'no-store' });
    if (!res.ok) return [];
    return (await res.json()) as ComponentHealth[];
  } catch {
    return [];
  }
}

export async function fetchZ0TableData(tableName: string): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/data/${tableName}`, { cache: 'no-store' });
    if (!res.ok) return [];
    return (await res.json()) as any[];
  } catch {
    return [];
  }
}

export async function fetchTableSizes(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/data/sizes`, { cache: 'no-store' });
    if (!res.ok) return [];
    return (await res.json()) as any[];
  } catch {
    return [];
  }
}

export async function fetchTablePartitions(tableName: string): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/data/sizes/${tableName}`, { cache: 'no-store' });
    if (!res.ok) return [];
    return (await res.json()) as any[];
  } catch {
    return [];
  }
}

/* ── Z1 Feature Data ───────────────────────── */

export async function fetchZ1TableData(tableName: string): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/z1/data/${tableName}`, { cache: 'no-store' });
    if (!res.ok) return [];
    return (await res.json()) as any[];
  } catch {
    return [];
  }
}

export async function fetchZ1TableSizes(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/z1/data/sizes`, { cache: 'no-store' });
    if (!res.ok) return [];
    return (await res.json()) as any[];
  } catch {
    return [];
  }
}

export async function fetchZ1Dashboard(symbol = 'BTCUSDT'): Promise<Z1DashboardResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/z1/dashboard?symbol=${encodeURIComponent(symbol)}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()) as Z1DashboardResponse;
  } catch {
    return null;
  }
}

export async function fetchZ2TableSizes(): Promise<TableSizeSummaryRow[]> {
  try {
    const res = await fetch(`${API_BASE}/z2/data/sizes`, { cache: 'no-store' });
    if (!res.ok) return [];
    return (await res.json()) as TableSizeSummaryRow[];
  } catch {
    return [];
  }
}

/* ── Z2 Context Data ────────────────────────── */

export interface Z2GlobalContext {
  CONTEXT_ID: string;
  GENERATED_AT: string;
  TRIGGER_TYPE: string;
  REGIME: string;
  REGIME_SCORE: number;
  SENTIMENT: string;
  CONFIDENCE_SCORE: number;
  SUMMARY: string;
  KEY_FACTORS: string;   // JSON string
  VALID_UNTIL: string;
  MODEL_USED: string;
  PROMPT_VERSION: string;
  TOKEN_USAGE: number;
}

export interface Z2LocalContext {
  CONTEXT_ID: string;
  SYMBOL: string;
  GENERATED_AT: string;
  TRIGGER_TYPE: string;
  REGIME: string;
  REGIME_SCORE: number;
  SENTIMENT: string;
  CONFIDENCE_SCORE: number;
  ATR_STATE: string;
  SUMMARY: string;
  KEY_FACTORS: string;        // JSON string
  SUPPORT_RESISTANCE: string; // JSON string
  VALID_UNTIL: string;
  MODEL_USED: string;
  PROMPT_VERSION: string;
}

export async function fetchZ2GlobalLatest(): Promise<Z2GlobalContext | null> {
  try {
    const res = await fetch(`${API_BASE}/z2/global/latest`, { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()) as Z2GlobalContext;
  } catch { return null; }
}

export async function fetchZ2LocalLatest(symbol: string): Promise<Z2LocalContext | null> {
  try {
    const res = await fetch(`${API_BASE}/z2/local/latest/${symbol}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()) as Z2LocalContext;
  } catch { return null; }
}

export async function postZ2Trigger(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/z2/trigger`, { method: 'POST' });
    return res.ok;
  } catch { return false; }
}

/* ── Z0 소스 목록 조합 ──────────────────────── */

import type { SysDataSource } from '@/types/system';
import type { ProviderType, RunStatus } from '@/types/common';
import type { Z1DashboardResponse } from '@/types/z1-dashboard';

function extractProvider(id: string): ProviderType {
  if (id.startsWith('binance-')) return 'binance';
  if (id.startsWith('fred-'))   return 'fred';
  if (id.startsWith('coingecko-')) return 'coingecko';
  if (id.startsWith('yahoo-'))  return 'yahoo';
  if (id.startsWith('rss-'))    return 'rss';
  if (id.startsWith('cryptoquant')) return 'cryptoquant';
  if (id.startsWith('coinglass'))  return 'coinglass';
  return 'binance';
}

function deriveRunStatus(running: boolean, hs?: string): RunStatus {
  if (!running) return hs === 'DOWN' ? 'error' : 'stopped';
  if (hs === 'DOWN') return 'error';
  if (hs === 'DEGRADED') return 'cooldown';
  return 'running';
}

/** /collectors + /health/components 결합 → SysDataSource[] */
export async function fetchSources(): Promise<SysDataSource[]> {
  const [collectors, health] = await Promise.all([
    fetchCollectors(),
    fetchHealthComponents(),
  ]);
  const hm = new Map(health.map((h) => [h.componentId, h]));

  return collectors.map((c) => {
    const h = hm.get(c.sourceId);
    return {
      sourceId:     c.sourceId,
      sourceName:   c.label,
      providerType: extractProvider(c.sourceId),
      endpoint:     '',
      isActive:     c.running,
      runStatus:    deriveRunStatus(c.running, h?.status),
      lastSuccessAt: h?.status === 'UP' ? h.lastHeartbeat : null,
      lastErrorAt:   (h?.status === 'DOWN' || h?.status === 'DEGRADED') ? h.lastHeartbeat : null,
      lastErrorMsg:  h?.status === 'DOWN' ? `Health: DOWN (errors: ${h?.metrics?.errorsLast1h ?? 0})` : null,
      createdAt:    '',
      updatedAt:    h?.lastHeartbeat ?? '',
      config:       { 
        rowsProcessed: h?.metrics?.rowsProcessed, 
        totalRows:     c.totalRows ?? h?.metrics?.totalRows,
        recentRows:    h?.metrics?.recentRows,
        avgLatencyMs:  h?.metrics?.avgLatencyMs 
      },
    };
  });
}
