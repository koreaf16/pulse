/**
 * ============================================================================
 * @file        global-context-card.tsx
 * @description Z2 Global Context 카드 — 시장 국면·거시 요약 표시.
 * @zone        Z2
 * @domain      Context
 *
 * @dependencies @/lib/api
 * @called_by   app/z2/page.tsx
 * @feeds_to    -
 *
 * @strict_rule 300라인 제한 준수.
 * ============================================================================
 */
import type { Z2GlobalContext } from '@/lib/api';

const REGIME_STYLE: Record<string, { bg: string; text: string }> = {
  STRONG_UPTREND:   { bg: '#E8FBF6', text: '#00B894' },
  UPTREND:          { bg: '#E8FBF6', text: '#00B894' },
  RANGE_BOUND:      { bg: '#FFF8E6', text: '#E17055' },
  DOWNTREND:        { bg: '#FFEAEA', text: '#D63031' },
  STRONG_DOWNTREND: { bg: '#FFEAEA', text: '#D63031' },
};

const SENTIMENT_STYLE: Record<string, { bg: string; text: string }> = {
  STRONGLY_BULLISH: { bg: '#E8FBF6', text: '#00B894' },
  BULLISH:          { bg: '#E8FBF6', text: '#00B894' },
  NEUTRAL:          { bg: '#F5F6FA', text: '#636E72' },
  BEARISH:          { bg: '#FFEAEA', text: '#D63031' },
  STRONGLY_BEARISH: { bg: '#FFEAEA', text: '#D63031' },
};

function Badge({ label, styleMap, value }: { label: string; styleMap: Record<string, { bg: string; text: string }>; value: string }) {
  const s = styleMap[value] ?? { bg: '#F5F6FA', text: '#636E72' };
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: s.bg, color: s.text }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.text }} />
      {value}
    </span>
  );
}

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

interface Props { ctx: Z2GlobalContext }

export function GlobalContextCard({ ctx }: Props) {
  let factors: string[] = [];
  try { factors = JSON.parse(ctx.KEY_FACTORS) as string[]; } catch { /* empty */ }

  return (
    <div className="rounded-xl bg-white shadow-sm border-l-4 p-6" style={{ borderLeftColor: '#6C5CE7' }}>
      <div className="flex gap-6">
        {/* ── Left: Regime + Summary ─────────────────────── */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge label="REGIME" styleMap={REGIME_STYLE} value={ctx.REGIME} />
            <Badge label="SENTIMENT" styleMap={SENTIMENT_STYLE} value={ctx.SENTIMENT} />
            <span className="ml-auto font-data text-base font-bold" style={{ color: '#6C5CE7' }}>
              {Math.round((ctx.CONFIDENCE_SCORE ?? 0) * 100)}%
            </span>
            <span className="text-[11px] text-[#B2BEC3]">신뢰도</span>
          </div>

          <p className="text-[11px] font-medium uppercase tracking-wide text-[#636E72] mt-4 mb-1.5">시장 요약</p>
          <p className="text-sm text-[#1A1D23] leading-relaxed">{ctx.SUMMARY}</p>

          <div className="mt-4 flex items-center gap-1.5 text-xs text-[#B2BEC3]">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{ctx.TRIGGER_TYPE} · {formatRelative(ctx.GENERATED_AT)} · 유효 {formatUntil(ctx.VALID_UNTIL)}</span>
          </div>
        </div>

        {/* ── Right: Key Factors ──────────────────────────── */}
        <div className="w-72 flex-shrink-0 rounded-lg p-4" style={{ backgroundColor: '#F8F9FB' }}>
          <p className="text-[11px] font-medium uppercase tracking-wide text-[#636E72] mb-3">핵심 요인</p>
          {factors.length === 0 ? (
            <p className="text-xs text-[#B2BEC3]">데이터 없음</p>
          ) : (
            <ul className="space-y-2">
              {factors.map((f, i) => (
                <li key={i} className="rounded-lg border border-[#E8ECEF] bg-white px-3 py-2 text-xs text-[#1A1D23]">{f}</li>
              ))}
            </ul>
          )}
          <div className="mt-4 space-y-0.5 text-[10px] text-[#B2BEC3]">
            <p>프롬프트 {ctx.PROMPT_VERSION} · {ctx.MODEL_USED?.split('/').pop()}</p>
            <p>토큰 {(ctx.TOKEN_USAGE ?? 0).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
