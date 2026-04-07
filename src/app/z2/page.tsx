'use client';
/**
 * ============================================================================
 * @file        page.tsx
 * @description Z2 Context Zone 페이지에서 글로벌/로컬 컨텍스트를 표시한다.
 * @zone        Z2
 * @domain      Context
 *
 * @dependencies @/lib/api, @/lib/utils, @/components/z2/*, @/components/layout/page-header
 * @called_by   Next.js App Router (/z2)
 * @feeds_to    -
 *
 * @strict_rule 300라인 제한 준수.
 * ============================================================================
 */
import { useCallback, useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { GlobalContextCard } from '@/components/z2/global-context-card';
import { LocalContextCard } from '@/components/z2/local-context-card';
import { timeAgo } from '@/lib/utils';
import {
  fetchZ2GlobalLatest,
  fetchZ2LocalLatest,
  postZ2Trigger,
  type Z2GlobalContext,
  type Z2LocalContext,
} from '@/lib/api';

const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT', 'ADAUSDT', 'AVAXUSDT', 'DOGEUSDT', 'LINKUSDT', 'DOTUSDT'];

function formatUntil(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return '만료됨';

  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}분 후`;
  return `${Math.floor(minutes / 60)}시간 ${minutes % 60}분 후`;
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#E8ECEF] bg-[#FAFBFC] py-14">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#F0EEFF]">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="#6C5CE7">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
          />
        </svg>
      </div>
      <p className="text-[13px] font-semibold text-[#1A1D23]">데이터 없음</p>
      <p className="mt-1 text-[13px] text-[#636E72]">{message}</p>
    </div>
  );
}

export default function Z2Page() {
  const [globalCtx, setGlobalCtx] = useState<Z2GlobalContext | null>(null);
  const [localCtx, setLocalCtx] = useState<Z2LocalContext | null>(null);
  const [symbol, setSymbol] = useState(SYMBOLS[0]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [triggerMsg, setTriggerMsg] = useState('');

  const refresh = useCallback(async (sym: string) => {
    const [g, l] = await Promise.all([fetchZ2GlobalLatest(), fetchZ2LocalLatest(sym)]);
    setGlobalCtx(g);
    setLocalCtx(l);
    setLoading(false);
  }, []);

  useEffect(() => {
    setLoading(true);
    void refresh(symbol);
    const id = setInterval(() => void refresh(symbol), 60_000);
    return () => clearInterval(id);
  }, [symbol, refresh]);

  const handleTrigger = async () => {
    setTriggering(true);
    setTriggerMsg('');
    const ok = await postZ2Trigger();
    setTriggerMsg(ok ? '실행 요청 완료' : '실행 실패');
    setTriggering(false);
    setTimeout(() => setTriggerMsg(''), 3000);
  };

  const updatedAt = globalCtx ? timeAgo(globalCtx.GENERATED_AT) : '없음';
  const validUntil = globalCtx ? formatUntil(globalCtx.VALID_UNTIL) : '없음';
  const confidence = globalCtx ? `${Math.round(globalCtx.CONFIDENCE_SCORE * 100)}%` : '없음';
  const modelName = globalCtx ? globalCtx.MODEL_USED?.split('/').pop() ?? '없음' : '없음';

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-10">
      <PageHeader
        title="Z2 컨텍스트"
        description="LLM이 정리한 시장 전역 요약과 심볼별 해석을 한 화면에서 확인합니다."
        zone="Z2"
        actions={
          <div className="flex items-center gap-2">
            {triggerMsg && <span className="text-xs text-[#636E72]">{triggerMsg}</span>}
            <button
              onClick={handleTrigger}
              disabled={triggering}
              className="flex items-center gap-1.5 rounded-lg bg-[#6C5CE7] px-3.5 py-2 text-[13px] font-medium text-white transition-colors disabled:opacity-60"
            >
              {triggering ? (
                <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )}
              수동 실행
            </button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: '최근 생성', value: updatedAt },
          { label: '유효 기간', value: validUntil },
          { label: '신뢰도', value: confidence },
          { label: '모델', value: modelName, sub: 'Global 생성 모델' },
        ].map(({ label, value, sub }) => (
          <div key={label} className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-[10px] font-medium tracking-[0.12em] text-[#636E72]">{label}</p>
            <p className="font-data mt-1.5 text-[17px] font-bold leading-tight text-[#1A1D23]">{value}</p>
            {sub && <p className="mt-0.5 text-[10px] text-[#B2BEC3]">{sub}</p>}
          </div>
        ))}
      </div>

      <div>
        <p className="mb-3 text-[10px] font-semibold tracking-[0.18em] text-[#636E72]">글로벌 컨텍스트</p>
        {loading ? (
          <div className="h-40 animate-pulse rounded-2xl bg-white shadow-sm" />
        ) : globalCtx ? (
          <GlobalContextCard ctx={globalCtx} />
        ) : (
          <EmptyState message="Z2 파이프라인 실행 후 글로벌 컨텍스트가 생성됩니다." />
        )}
      </div>

      <div>
        <p className="mb-3 text-[10px] font-semibold tracking-[0.18em] text-[#636E72]">로컬 컨텍스트</p>

        <div className="mb-4 flex flex-wrap gap-1.5">
          {SYMBOLS.map((sym) => (
            <button
              key={sym}
              onClick={() => {
                setSymbol(sym);
                setLocalCtx(null);
              }}
              className="rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-colors"
              style={sym === symbol
                ? { backgroundColor: '#F0EEFF', color: '#6C5CE7', borderColor: '#6C5CE7' }
                : { backgroundColor: '#FFFFFF', color: '#636E72', borderColor: '#E8ECEF' }}
            >
              {sym.replace('USDT', '')}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="h-48 animate-pulse rounded-2xl bg-white shadow-sm" />
        ) : localCtx ? (
          <LocalContextCard ctx={localCtx} />
        ) : (
          <EmptyState message={`${symbol.replace('USDT', '')} 로컬 컨텍스트가 아직 없습니다.`} />
        )}
      </div>
    </div>
  );
}
