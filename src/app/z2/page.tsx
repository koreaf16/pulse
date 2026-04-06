'use client';
/**
 * ============================================================================
 * @file        page.tsx
 * @description Z2 Context Zone 페이지 — Global/Local LLM 컨텍스트 + 심볼 탭.
 * @zone        Z2
 * @domain      Context
 *
 * @dependencies @/lib/api, @/components/z2/*, @/components/layout/page-header
 * @called_by   Next.js App Router (/z2)
 * @feeds_to    -
 *
 * @strict_rule 300라인 제한 준수.
 * ============================================================================
 */
import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { GlobalContextCard } from '@/components/z2/global-context-card';
import { LocalContextCard } from '@/components/z2/local-context-card';
import {
  fetchZ2GlobalLatest, fetchZ2LocalLatest, postZ2Trigger,
  type Z2GlobalContext, type Z2LocalContext,
} from '@/lib/api';

const SYMBOLS = [
  'BTCUSDT','ETHUSDT','BNBUSDT','SOLUSDT','XRPUSDT',
  'ADAUSDT','AVAXUSDT','DOGEUSDT','LINKUSDT','DOTUSDT',
];

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return '방금 전';
  if (m < 60) return `${m}분 전`;
  return `${Math.floor(m / 60)}시간 ${m % 60}분 전`;
}

function formatUntil(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return '만료됨';
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}분 남음`;
  return `${Math.floor(m / 60)}시간 ${m % 60}분 남음`;
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#E8ECEF] bg-[#FAFBFC] py-16">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: '#F0EEFF' }}>
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="#6C5CE7">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-[#1A1D23]">데이터 없음</p>
      <p className="mt-1 text-sm text-[#636E72]">{message}</p>
    </div>
  );
}

export default function Z2Page() {
  const [globalCtx, setGlobalCtx]     = useState<Z2GlobalContext | null>(null);
  const [localCtx,  setLocalCtx]      = useState<Z2LocalContext  | null>(null);
  const [symbol,    setSymbol]         = useState(SYMBOLS[0]);
  const [loading,   setLoading]        = useState(true);
  const [triggering, setTriggering]    = useState(false);
  const [triggerMsg, setTriggerMsg]    = useState('');

  const refresh = useCallback(async (sym: string) => {
    const [g, l] = await Promise.all([
      fetchZ2GlobalLatest(),
      fetchZ2LocalLatest(sym),
    ]);
    setGlobalCtx(g);
    setLocalCtx(l);
    setLoading(false);
  }, []);

  useEffect(() => {
    setLoading(true);
    refresh(symbol);
    const id = setInterval(() => refresh(symbol), 60_000);
    return () => clearInterval(id);
  }, [symbol, refresh]);

  const handleSymbol = (sym: string) => {
    setSymbol(sym);
    setLocalCtx(null);
  };

  const handleTrigger = async () => {
    setTriggering(true);
    setTriggerMsg('');
    const ok = await postZ2Trigger();
    setTriggerMsg(ok ? '트리거 발행됨' : '실패');
    setTriggering(false);
    setTimeout(() => setTriggerMsg(''), 3000);
  };

  // ── 통계 카드용 값 ──
  const updatedAt   = globalCtx ? formatRelative(globalCtx.GENERATED_AT) : '—';
  const validUntil  = globalCtx ? formatUntil(globalCtx.VALID_UNTIL)     : '—';
  const confidence  = globalCtx ? `${Math.round(globalCtx.CONFIDENCE_SCORE * 100)}%` : '—';
  const models      = globalCtx ? globalCtx.MODEL_USED?.split('/').pop() ?? '—'        : '—';

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-10">

      {/* ── 헤더 ─────────────────────────────────── */}
      <PageHeader
        title="컨텍스트 존"
        description="LLM 합성 컨텍스트 — 시장 국면·심층 추론 분석"
        zone="Z2"
        actions={
          <div className="flex items-center gap-2">
            {triggerMsg && (
              <span className="text-xs text-[#636E72]">{triggerMsg}</span>
            )}
            <button
              onClick={handleTrigger}
              disabled={triggering}
              className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-60"
              style={{ backgroundColor: '#6C5CE7' }}
            >
              {triggering
                ? <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                : <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              }
              수동 트리거
            </button>
          </div>
        }
      />

      {/* ── 통계 4 Cards ─────────────────────────── */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: '마지막 갱신', value: updatedAt },
          { label: '유효 기간',   value: validUntil },
          { label: '신뢰도',      value: confidence },
          { label: '모델',        value: models, sub: 'Primary · 35B Secondary' },
        ].map(({ label, value, sub }) => (
          <div key={label} className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-[11px] font-medium uppercase tracking-wide text-[#636E72]">{label}</p>
            <p className="font-data mt-1.5 text-lg font-bold text-[#1A1D23] leading-tight">{value}</p>
            {sub && <p className="mt-0.5 text-[10px] text-[#B2BEC3]">{sub}</p>}
          </div>
        ))}
      </div>

      {/* ── Global Context ───────────────────────── */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#636E72]">Global Context</p>
        {loading
          ? <div className="h-40 rounded-xl bg-white animate-pulse shadow-sm" />
          : globalCtx
            ? <GlobalContextCard ctx={globalCtx} />
            : <EmptyState message="Z2 파이프라인 실행 후 글로벌 컨텍스트가 생성됩니다." />
        }
      </div>

      {/* ── Local Context ────────────────────────── */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#636E72]">Local Context</p>

        {/* 심볼 탭 */}
        <div className="mb-4 flex flex-wrap gap-1.5">
          {SYMBOLS.map(sym => (
            <button
              key={sym}
              onClick={() => handleSymbol(sym)}
              className="rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors"
              style={sym === symbol
                ? { backgroundColor: '#F0EEFF', color: '#6C5CE7', borderColor: '#6C5CE7' }
                : { backgroundColor: '#FFFFFF', color: '#636E72', borderColor: '#E8ECEF' }
              }
            >
              {sym.replace('USDT', '')}
            </button>
          ))}
        </div>

        {loading
          ? <div className="h-48 rounded-xl bg-white animate-pulse shadow-sm" />
          : localCtx
            ? <LocalContextCard ctx={localCtx} />
            : <EmptyState message={`${symbol} 로컬 컨텍스트가 아직 없습니다.`} />
        }
      </div>

    </div>
  );
}
