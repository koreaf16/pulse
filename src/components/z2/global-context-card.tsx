/**
 * ============================================================================
 * @file        global-context-card.tsx
 * @description Z2 Global Context 카드를 렌더링하는 컴포넌트.
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
import type { Z2GlobalContext } from '@/lib/api';
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

function Badge({ styleMap, value }: { styleMap: Record<string, { bg: string; text: string }>; value: string }) {
  const style = styleMap[value] ?? { bg: '#F5F6FA', text: '#636E72' };
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: style.bg, color: style.text }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: style.text }} />
      {translateSignalLabel(value)}
    </span>
  );
}

function parseFactors(input: string): string[] {
  try {
    return JSON.parse(input) as string[];
  } catch {
    return [];
  }
}

interface Props {
  ctx: Z2GlobalContext;
}

export function GlobalContextCard({ ctx }: Props) {
  const factors = parseFactors(ctx.KEY_FACTORS);

  return (
    <div className="rounded-2xl border-l-4 bg-white p-5 shadow-sm" style={{ borderLeftColor: '#6C5CE7' }}>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_280px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge styleMap={REGIME_STYLE} value={ctx.REGIME} />
            <Badge styleMap={SENTIMENT_STYLE} value={ctx.SENTIMENT} />
            <div className="ml-auto rounded-full bg-[#F0EEFF] px-3 py-1 text-xs font-semibold text-[#6C5CE7]">
              신뢰도 {Math.round((ctx.CONFIDENCE_SCORE ?? 0) * 100)}%
            </div>
          </div>

          <p className="mt-4 text-[10px] font-medium tracking-[0.12em] text-[#636E72]">시장 요약</p>
          <p className="mt-1.5 text-[13px] leading-6 text-[#1A1D23]">{ctx.SUMMARY}</p>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-[#636E72]">
            <span>{translateSignalLabel(ctx.TRIGGER_TYPE)}</span>
            <span>·</span>
            <span>생성 {timeAgo(ctx.GENERATED_AT)}</span>
            <span>·</span>
            <span>유효 {toETString(ctx.VALID_UNTIL)}</span>
          </div>
        </div>

        <div className="rounded-2xl bg-[#F8F9FB] p-4">
          <p className="text-[10px] font-medium tracking-[0.12em] text-[#636E72]">핵심 요인</p>
          {factors.length === 0 ? (
            <p className="mt-3 text-[12px] text-[#B2BEC3]">핵심 요인이 아직 없습니다.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {factors.map((factor, index) => (
                <li key={`${factor}-${index}`} className="rounded-xl border border-[#E8ECEF] bg-white px-3 py-2 text-[12px] text-[#1A1D23]">
                  {factor}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4 space-y-0.5 text-[10px] text-[#B2BEC3]">
            <p>프롬프트 {ctx.PROMPT_VERSION}</p>
            <p>모델 {ctx.MODEL_USED?.split('/').pop()}</p>
            <p>토큰 {(ctx.TOKEN_USAGE ?? 0).toLocaleString('ko-KR')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
