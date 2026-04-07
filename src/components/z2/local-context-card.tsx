/**
 * ============================================================================
 * @file        local-context-card.tsx
 * @description Z2 Local Context 카드를 렌더링하는 컴포넌트.
 * @zone        Z2
 * @domain      Context
 *
 * @dependencies @/lib/api, @/lib/utils
 * @called_by   app/z2/page.tsx
 * @feeds_to    -
 *
 * @strict_rule 300라인 제한 준수.
 * ============================================================================
 */
import type { Z2LocalContext } from '@/lib/api';
import { timeAgo, toETString, translateSignalLabel } from '@/lib/utils';

const REGIME_STYLE: Record<string, { bg: string; text: string }> = {
  STRONG_UPTREND: { bg: '#E8FBF6', text: '#00B894' },
  UPTREND: { bg: '#E8FBF6', text: '#00B894' },
  RANGE_BOUND: { bg: '#FFF8E6', text: '#E17055' },
  DOWNTREND: { bg: '#FFEAEA', text: '#D63031' },
  STRONG_DOWNTREND: { bg: '#FFEAEA', text: '#D63031' },
};

const SENTIMENT_STYLE: Record<string, { bg: string; text: string }> = {
  STRONGLY_BULLISH: { bg: '#E8FBF6', text: '#00B894' },
  BULLISH: { bg: '#E8FBF6', text: '#00B894' },
  NEUTRAL: { bg: '#F5F6FA', text: '#636E72' },
  BEARISH: { bg: '#FFEAEA', text: '#D63031' },
  STRONGLY_BEARISH: { bg: '#FFEAEA', text: '#D63031' },
};

const ATR_STYLE: Record<string, { bg: string; text: string }> = {
  EXTREME_VOLATILITY: { bg: '#FFEAEA', text: '#D63031' },
  HIGH_VOLATILITY: { bg: '#FFF8E6', text: '#E17055' },
  NORMAL_VOLATILITY: { bg: '#EBF5FF', text: '#0984E3' },
  LOW_VOLATILITY: { bg: '#F5F6FA', text: '#636E72' },
};

function Badge({ styleMap, value }: { styleMap: Record<string, { bg: string; text: string }>; value: string }) {
  const style = styleMap[value] ?? { bg: '#F5F6FA', text: '#636E72' };
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ backgroundColor: style.bg, color: style.text }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: style.text }} />
      {translateSignalLabel(value)}
    </span>
  );
}

interface SupportResistance {
  r3?: number;
  r2?: number;
  r1?: number;
  s1?: number;
  s2?: number;
  s3?: number;
  current?: number;
}

function parseJsonArray(input: string): string[] {
  try {
    return JSON.parse(input) as string[];
  } catch {
    return [];
  }
}

function parseSupportResistance(input: string): SupportResistance {
  try {
    return JSON.parse(input) as SupportResistance;
  } catch {
    return {};
  }
}

function SRLevel({ label, price, type }: { label: string; price?: number; type: 'resistance' | 'support' | 'current' }) {
  if (price == null) return null;

  const colors = {
    resistance: { label: '#D63031', price: '#D63031' },
    support: { label: '#00B894', price: '#00B894' },
    current: { label: '#6C5CE7', price: '#6C5CE7' },
  }[type];

  return (
    <div className={`flex items-center justify-between py-1 ${type === 'current' ? 'my-0.5 border-y border-dashed border-[#E8ECEF]' : ''}`}>
      <span className="text-[11px] font-medium" style={{ color: colors.label }}>{label}</span>
      <span className="font-data text-[13px] font-semibold" style={{ color: colors.price }}>
        {price.toLocaleString('ko-KR', { maximumFractionDigits: 1 })}
      </span>
    </div>
  );
}

interface Props {
  ctx: Z2LocalContext;
}

export function LocalContextCard({ ctx }: Props) {
  const factors = parseJsonArray(ctx.KEY_FACTORS);
  const sr = parseSupportResistance(ctx.SUPPORT_RESISTANCE);
  const regimeScore = Math.round((ctx.REGIME_SCORE ?? 0) * 100);
  const confidenceScore = Math.round((ctx.CONFIDENCE_SCORE ?? 0) * 100);

  return (
    <div className="rounded-2xl border border-[#E8ECEF] bg-white p-5 shadow-sm">
      <div className="grid gap-5 xl:grid-cols-[180px_minmax(0,1fr)_160px]">
        <div>
          <div className="mb-3">
            <p className="font-data text-[16px] font-bold text-[#1A1D23]">{ctx.SYMBOL}</p>
            <p className="text-[11px] text-[#B2BEC3]">Binance Futures</p>
          </div>
          <div className="space-y-1.5">
            <Badge styleMap={REGIME_STYLE} value={ctx.REGIME} />
            <Badge styleMap={ATR_STYLE} value={ctx.ATR_STATE} />
            <Badge styleMap={SENTIMENT_STYLE} value={ctx.SENTIMENT} />
          </div>

          <div className="mt-4 space-y-2">
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[11px] text-[#636E72]">국면 점수</span>
                <span className="font-data text-xs font-semibold text-[#6C5CE7]">{regimeScore}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#F0EEFF]">
                <div className="h-full rounded-full bg-[#6C5CE7]" style={{ width: `${regimeScore}%` }} />
              </div>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[11px] text-[#636E72]">신뢰도</span>
                <span className="font-data text-xs font-bold text-[#6C5CE7]">{confidenceScore}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#F0EEFF]">
                <div className="h-full rounded-full bg-[#6C5CE7]" style={{ width: `${confidenceScore}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="min-w-0">
          <p className="text-[10px] font-medium tracking-[0.12em] text-[#636E72]">심볼 요약</p>
          <p className="mt-1.5 text-[13px] leading-6 text-[#1A1D23]">{ctx.SUMMARY}</p>

          {factors.length > 0 && (
            <>
              <p className="mt-4 text-[10px] font-medium tracking-[0.12em] text-[#636E72]">핵심 요인</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {factors.slice(0, 4).map((factor, index) => (
                  <span key={`${factor}-${index}`} className="rounded-md border border-[#E8ECEF] bg-[#FAFBFC] px-2 py-1 text-[12px] text-[#1A1D23]">
                    {factor}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        <div>
          <p className="mb-2 text-[10px] font-medium tracking-[0.12em] text-[#636E72]">지지 / 저항</p>
          {(sr.r3 || sr.r2 || sr.r1 || sr.current || sr.s1 || sr.s2 || sr.s3) ? (
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
            <p className="text-[12px] text-[#B2BEC3]">레벨 데이터 없음</p>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#F5F6FA] pt-3 text-[10px] text-[#B2BEC3]">
        <span>{timeAgo(ctx.GENERATED_AT)}</span>
        <span>·</span>
        <span>유효 {toETString(ctx.VALID_UNTIL)}</span>
        <span>·</span>
        <span>{translateSignalLabel(ctx.TRIGGER_TYPE)}</span>
        <span>·</span>
        <span>{ctx.PROMPT_VERSION}</span>
        <span>·</span>
        <span>{ctx.MODEL_USED?.split('/').pop()}</span>
      </div>
    </div>
  );
}
