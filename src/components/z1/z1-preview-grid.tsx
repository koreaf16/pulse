'use client';

import { timeAgo, translateSignalLabel } from '@/lib/utils';
import type { Z1DashboardCorrelation, Z1DashboardNews } from '@/types/z1-dashboard';

interface Props {
  news: Z1DashboardNews;
  correlation: Z1DashboardCorrelation[];
}

function sentimentStyle(value: string | null | undefined): { bg: string; text: string } {
  if (!value) return { bg: '#F8FAFC', text: '#475569' };
  if (value.includes('BULL')) return { bg: '#ECFDF3', text: '#15803D' };
  if (value.includes('BEAR')) return { bg: '#FEF2F2', text: '#B91C1C' };
  return { bg: '#F8FAFC', text: '#475569' };
}

function clip(text: string, length = 150): string {
  return text.length <= length ? text : `${text.slice(0, length).trim()}...`;
}

export function Z1PreviewGrid({ news, correlation }: Props) {
  const dominantStyle = sentimentStyle(news.dominantLabel);

  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
      <div className="rounded-[28px] border border-[#FDE68A] bg-[linear-gradient(180deg,#FFFBEB_0%,#FFFFFF_100%)] p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.18em] text-[#64748B]">뉴스 심리</p>
            <h3 className="mt-2 text-[18px] font-semibold text-[#0F172A]">
              {translateSignalLabel(news.dominantLabel ?? 'PENDING')}
            </h3>
          </div>
          <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: dominantStyle.bg, color: dominantStyle.text }}>
            평균 {news.averageSentiment != null ? news.averageSentiment.toFixed(2) : '없음'}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {news.topTopics.length === 0 ? (
            <span className="text-[13px] text-[#94A3B8]">토픽 칩이 아직 없습니다.</span>
          ) : news.topTopics.map((topic) => (
            <span key={topic} className="rounded-full border border-[#FDE68A] bg-white px-3 py-1 text-xs font-medium text-[#92400E]">
              {topic}
            </span>
          ))}
        </div>

        <div className="mt-5 space-y-3">
          {news.items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#E2E8F0] bg-white/70 px-4 py-6 text-[13px] text-[#64748B]">
              다음 파이프라인 주기 이후 뉴스 임베딩 결과가 여기에 표시됩니다.
            </div>
          ) : news.items.map((item) => {
            const style = sentimentStyle(item.SENTIMENT_LABEL);
            return (
              <article key={`${item.ARTICLE_ID}-${item.PUBLISHED_AT}`} className="rounded-[22px] border border-[#FDE68A] bg-white/90 px-4 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ backgroundColor: style.bg, color: style.text }}>
                    {translateSignalLabel(item.SENTIMENT_LABEL)}
                  </span>
                  <span className="text-xs text-[#64748B]">{item.SYMBOL ?? '시장 전체'}</span>
                  <span className="text-xs text-[#94A3B8]">{timeAgo(item.PUBLISHED_AT)}</span>
                </div>
                <p className="mt-3 text-[13px] leading-6 text-[#334155]">{clip(item.CHUNK_TEXT)}</p>
              </article>
            );
          })}
        </div>
      </div>

      <div className="rounded-[28px] border border-[#C7D2FE] bg-[linear-gradient(180deg,#EEF2FF_0%,#FFFFFF_100%)] p-6 shadow-sm">
        <p className="text-[10px] font-semibold tracking-[0.18em] text-[#64748B]">자산 상관관계</p>
        <h3 className="mt-2 text-[18px] font-semibold text-[#0F172A]">BTC와 가장 가까운 자산</h3>

        <div className="mt-5 space-y-3">
          {correlation.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-white/70 px-4 py-6 text-[13px] text-[#64748B]">
              상관관계 데이터가 아직 없습니다.
            </div>
          ) : correlation.map((row) => (
            <div key={`${row.PEER_SYMBOL}-${row.CALC_DATE}`} className="rounded-[22px] border border-[#C7D2FE] bg-white/90 px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[13px] font-semibold text-[#0F172A]">{row.PEER_SYMBOL.replace('USDT', '')}</p>
                  <p className="mt-1 text-xs text-[#64748B]">
                    {translateSignalLabel(row.EDGE_TYPE)} · {row.LOOKBACK_DAYS}일 관찰
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${row.CORRELATION >= 0 ? 'bg-[#ECFDF3] text-[#15803D]' : 'bg-[#FEF2F2] text-[#B91C1C]'}`}>
                  {row.CORRELATION >= 0 ? '+' : ''}{row.CORRELATION.toFixed(2)}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-[#64748B]">
                <span>신뢰도 {row.CONFIDENCE != null ? row.CONFIDENCE.toFixed(2) : '없음'}</span>
                <span>{timeAgo(row.CALCULATED_AT)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
