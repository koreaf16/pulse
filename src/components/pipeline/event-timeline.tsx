import { timeAgo, formatPrice } from '@/lib/utils';
import { ZONE_COLORS } from '@/lib/design-tokens';
import type { PipelineEvent } from '@/types/events';

interface EventTimelineProps {
  events: PipelineEvent[];
}

function getEventLabel(event: PipelineEvent): { title: string; detail: string } {
  switch (event.eventType) {
    case 'candle_closed':
      return { title: `Candle closed · ${event.symbol} ${event.timeframe}`, detail: `Close: $${formatPrice(event.closePrice, event.symbol)}` };
    case 'funding_updated':
      return { title: `Funding updated · ${event.symbol}`, detail: `Rate: ${(event.fundingRate * 100).toFixed(4)}%` };
    case 'news_arrived':
      return { title: `News arrived · ${event.source}`, detail: event.symbols.join(', ') || 'Global' };
    case 'econ_data_updated':
      return { title: `Economic data · ${event.seriesId}`, detail: `Date: ${event.observationDate}` };
    case 'z1_feature_ready':
      return { title: `Z1 feature ready · ${event.featureType}`, detail: event.symbol ?? 'Global' };
    case 'z2_context_generated':
      return { title: 'Z2 context generated', detail: `${event.symbol ?? 'Global'} · ${event.trigger}` };
    default:
      const _exhaustive: never = event;
      void _exhaustive;
      return { title: 'Unknown event', detail: '' };
  }
}

export function EventTimeline({ events }: EventTimelineProps) {
  return (
    <div className="space-y-0">
      {events.map((event, idx) => {
        const { title, detail } = getEventLabel(event);
        const colors = ZONE_COLORS[event.zone];

        return (
          <div key={event.eventId} className="flex gap-3 group">
            <div className="flex flex-col items-center">
              <div className="mt-1 h-2.5 w-2.5 rounded-full flex-shrink-0 border-2 border-white" style={{ backgroundColor: colors.primary }} />
              {idx < events.length - 1 && <div className="w-0.5 flex-1 bg-[#E8ECEF] mt-0.5 mb-0.5" />}
            </div>

            <div className="pb-4 flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold mb-1" style={{ backgroundColor: colors.light, color: colors.primary }}>
                    {event.zone}
                  </span>
                  <p className="text-sm font-medium text-[#1A1D23] leading-snug truncate">{title}</p>
                  {detail && <p className="font-data text-xs text-[#636E72] mt-0.5">{detail}</p>}
                </div>
                <span className="flex-shrink-0 text-[11px] text-[#B2BEC3] whitespace-nowrap">{timeAgo(event.emittedAt)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
