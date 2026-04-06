/**
 * ============================================================================
 * @file        local-context-card.tsx
 * @description Z2 Local Context 카드 — 심볼별 국면·지지저항 레벨 표시.
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
import type { Z2LocalContext } from '@/lib/api';

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

const ATR_STYLE: Record<string, { bg: string; text: string }> = {
  EXTREME_VOLATILITY: { bg: '#FFEAEA', text: '#D63031' },
  HIGH_VOLATILITY:    { bg: '#FFF8E6', text: '#E17055' },
  NORMAL_VOLATILITY:  { bg: '#EBF5FF', text: '#0984E3' },
  LOW_VOLATILITY:     { bg: '#F5F6FA', text: '#636E72' },
};

function Badge({ styleMap, value }: { styleMap: Record<string, { bg: string; text: string }>; value: string }) {
  const s = styleMap[value] ?? { bg: '#F5F6FA', text: '#636E72' };
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ backgroundColor: s.bg, color: s.text }}>
      <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.text }} />
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

interface SupportResistance {
  r3?: number; r2?: number; r1?: number;
  s1?: number; s2?: number; s3?: number;
  current?: number;
}

function SRLevel({ label, price, type }: { label: string; price?: number; type: 'resistance' | 'support' | 'current' }) {
  if (price == null) return null;
  const colors = {
    resistance: { label: '#D63031', price: '#D63031' },
    support:    { label: '#00B894', price: '#00B894' },
    current:    { label: '#6C5CE7', price: '#6C5CE7' },
  }[type];

  return (
    <div className={`flex items-center justify-between py-1 ${type === 'current' ? 'border-y border-dashed border-[#E8ECEF] my-0.5' : ''}`}>
      <span className="text-[11px] font-medium" style={{ color: colors.label }}>{label}</span>
      <span className="font-data text-sm font-semibold" style={{ color: colors.price }}>
        {price.toLocaleString(undefined, { maximumFractionDigits: 1 })}
      </span>
    </div>
  );
}

interface Props { ctx: Z2LocalContext }

export function LocalContextCard({ ctx }: Props) {
  let factors: string[] = [];
  try { factors = JSON.parse(ctx.KEY_FACTORS) as string[]; } catch { /* empty */ }

  let sr: SupportResistance = {};
  try { sr = JSON.parse(ctx.SUPPORT_RESISTANCE) as SupportResistance; } catch { /* empty */ }

  return (
    <div className="rounded-xl bg-white shadow-sm border border-[#E8ECEF] p-5">
      <div className="flex gap-5">

        {/* ── Col 1: 신호 ──────────────────────────── */}
        <div className="w-44 flex-shrink-0">
          <div className="mb-3">
            <p className="font-data text-base font-bold text-[#1A1D23]">{ctx.SYMBOL}</p>
            <p className="text-[11px] text-[#B2BEC3]">Binance Futures</p>
          </div>
          <div className="space-y-1.5">
            <Badge styleMap={REGIME_STYLE}    value={ctx.REGIME}    />
            <Badge styleMap={ATR_STYLE}       value={ctx.ATR_STATE} />
            <Badge styleMap={SENTIMENT_STYLE} value={ctx.SENTIMENT} />
          </div>
          <div className="mt-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#636E72]">국면 점수</span>
              <span className="font-data text-xs font-semibold" style={{ color: '#6C5CE7' }}>
                {Math.round((ctx.REGIME_SCORE ?? 0) * 100)}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-[#F0EEFF] overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${Math.round((ctx.REGIME_SCORE ?? 0) * 100)}%`, backgroundColor: '#6C5CE7' }} />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[11px] text-[#636E72]">신뢰도</span>
              <span className="font-data text-xs font-bold" style={{ color: '#6C5CE7' }}>
                {Math.round((ctx.CONFIDENCE_SCORE ?? 0) * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* ── Col 2: 요약 + 핵심 요인 ──────────────── */}
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wide text-[#636E72] mb-1.5">심볼 요약</p>
          <p className="text-sm text-[#1A1D23] leading-relaxed">{ctx.SUMMARY}</p>
          {factors.length > 0 && (
            <>
              <p className="text-[11px] font-medium uppercase tracking-wide text-[#636E72] mt-3 mb-1.5">핵심 요인</p>
              <div className="flex flex-wrap gap-1.5">
                {factors.slice(0, 4).map((f, i) => (
                  <span key={i} className="rounded-md border border-[#E8ECEF] bg-[#FAFBFC] px-2 py-1 text-xs text-[#1A1D23]">{f}</span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── Col 3: 지지·저항 ─────────────────────── */}
        <div className="w-40 flex-shrink-0">
          <p className="text-[11px] font-medium uppercase tracking-wide text-[#636E72] mb-2">지지 / 저항</p>
          {(sr.r3 || sr.r2 || sr.r1 || sr.current || sr.s1 || sr.s2 || sr.s3)
            ? (
              <div className="space-y-0">
                <SRLevel label="R3" price={sr.r3} type="resistance" />
                <SRLevel label="R2" price={sr.r2} type="resistance" />
                <SRLevel label="R1" price={sr.r1} type="resistance" />
                <SRLevel label="현재" price={sr.current} type="current" />
                <SRLevel label="S1" price={sr.s1} type="support" />
                <SRLevel label="S2" price={sr.s2} type="support" />
                <SRLevel label="S3" price={sr.s3} type="support" />
              </div>
            ) : (
              <p className="text-xs text-[#B2BEC3]">데이터 없음</p>
            )
          }
        </div>

      </div>

      {/* ── Footer ────────────────────────────────── */}
      <div className="mt-4 flex items-center gap-3 border-t border-[#F5F6FA] pt-3 text-[10px] text-[#B2BEC3]">
        <span>{formatRelative(ctx.GENERATED_AT)}</span>
        <span>·</span>
        <span>유효 {formatUntil(ctx.VALID_UNTIL)}</span>
        <span>·</span>
        <span>{ctx.TRIGGER_TYPE}</span>
        <span>·</span>
        <span>{ctx.PROMPT_VERSION} · {ctx.MODEL_USED?.split('/').pop()}</span>
      </div>
    </div>
  );
}
