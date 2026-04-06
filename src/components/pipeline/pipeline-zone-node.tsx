/**
 * ============================================================================
 * @file        pipeline-zone-node.tsx
 * @description Z0/Z1/Z2 zone node card component for target table metrics and events.
 * @zone        INFRA
 * @domain      System
 *
 * @dependencies react
 * @called_by   components/pipeline/pipeline-live-view.tsx
 * @feeds_to    -
 *
 * @strict_rule
 *   1. Keep this file under 300 lines.
 *   2. Keep rendering logic presentation-only.
 *   3. Do not mix backend access into this component.
 * ============================================================================
 */
import type { RefObject } from 'react';

interface ZoneStat {
  label: string;
  value: string;
  color: string;
}

export interface TargetTable {
  label: string;
  color: string;
  id?: string;
  generatedRows?: number;
  storedRows?: number;
}

interface StatusBadge {
  label: string;
  color: string;
  bg: string;
  spinner?: boolean;
}

interface PipelineZoneNodeProps {
  zone: string;
  title: string;
  borderColor: string;
  glowAnim: string;
  glowDelay?: string;
  status: StatusBadge;
  stats?: ZoneStat[];
  targets?: TargetTable[];
  llm?: string;
  outputs?: string[];
  confidence?: number;
  eventRef?: RefObject<HTMLSpanElement | null>;
  eventDefault?: string;
  containerRef?: RefObject<HTMLDivElement | null>;
  registerTargetRef?: (label: string, node: HTMLDivElement | null) => void;
}

function formatRowCount(value?: number): string {
  if (!value) return '0';
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}

export function PipelineZoneNode({
  zone,
  title,
  borderColor,
  glowAnim,
  glowDelay,
  status,
  stats,
  targets,
  llm,
  outputs,
  confidence,
  eventRef,
  eventDefault,
  containerRef,
  registerTargetRef,
}: PipelineZoneNodeProps) {
  return (
    <div
      ref={containerRef}
      className="mx-auto flex h-full w-full max-w-none flex-col justify-between rounded-2xl bg-white p-4"
      style={{
        border: `2.5px solid ${borderColor}`,
        animation: `${glowAnim} 3s ease-in-out infinite`,
        animationDelay: glowDelay ?? '0s',
      }}
    >
      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="text-2xl font-bold leading-none" style={{ color: borderColor }}>
              {zone}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#6B7280] whitespace-nowrap">
              {title}
            </span>
          </div>
          <div
            className="flex items-center gap-1.5 rounded-full border px-2 py-0.5"
            style={{ background: status.bg, borderColor: `${status.color}30` }}
          >
            {status.spinner ? (
              <span className="inline-block h-2.5 w-2.5 animate-spin rounded-full border-[1.5px] border-[#DDD6FE] border-t-[#7C3AED]" />
            ) : (
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: status.color, boxShadow: `0 0 6px ${status.color}` }}
              />
            )}
            <span className="text-[9px] font-bold" style={{ color: status.color }}>
              {status.label}
            </span>
          </div>
        </div>

        {targets && (
          <div className="relative my-4 flex flex-col gap-2">
            {targets.map((target, index) => (
              <div
                key={index}
                ref={(node) => registerTargetRef?.(target.id || target.label, node)}
                className="relative z-10 flex min-h-8 items-center justify-between gap-2 rounded-lg border bg-[#F9FAFB] px-3 py-1.5 shadow-sm"
                style={{ borderColor: `${target.color}40` }}
              >
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: target.color, boxShadow: `0 0 4px ${target.color}` }}
                  />
                  <span className="text-[9px] font-mono font-bold text-slate-700 whitespace-nowrap">{target.label}</span>
                </div>
                <div className="ml-auto flex flex-shrink-0 items-center gap-2">
                  {(target.generatedRows != null || target.storedRows != null) && (
                    <div className="grid w-[216px] grid-cols-[104px_108px] gap-x-0.5 text-left">
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-left text-[8px] font-data font-bold text-[#475569] whitespace-nowrap">
                        최근 1분 {formatRowCount(target.generatedRows ?? 0)}
                      </span>
                      <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-left text-[8px] font-data font-bold text-emerald-700 whitespace-nowrap">
                        전체 테이블 {formatRowCount(target.storedRows ?? 0)}
                      </span>
                    </div>
                  )}
                  <svg
                    className="h-3.5 w-3.5 flex-shrink-0"
                    style={{ color: target.color }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}

        {stats && !targets && (
          <div className="my-3 space-y-1.5">
            {stats.map((stat) => (
              <div key={stat.label} className="flex justify-between text-[11px] text-[#374151]">
                <span>{stat.label}</span>
                <span className="font-data font-semibold" style={{ color: stat.color }}>
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {llm && <div className="mb-2 text-[10px] font-medium text-[#6B7280]">{llm}</div>}

        {outputs && !targets && (
          <div className="mb-3 flex gap-1.5">
            {outputs.map((output) => (
              <span
                key={output}
                className="flex-1 rounded-lg border border-[#DDD6FE] bg-[#FAF5FF] py-1.5 text-center text-[9px] font-semibold text-[#7C3AED]"
              >
                {output}
              </span>
            ))}
          </div>
        )}

        {confidence != null && (
          <div className="mb-2">
            <div className="mb-1 flex justify-between text-[9px] text-[#6B7280]">
              <span>Confidence</span>
              <span className="font-data font-bold text-[#7C3AED]">{confidence}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[#EDE9FE]">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${confidence}%`,
                  background: 'linear-gradient(90deg,#7C3AED,#A855F7)',
                  animation: 'fillPulse 3s ease-in-out infinite',
                }}
              />
            </div>
          </div>
        )}
      </div>

      {eventDefault && (
        <div className="mt-2 border-t border-[#E5E7EB] pt-2">
          <span ref={eventRef} className="block truncate text-[9px] font-medium text-[#6B7280]">
            {eventDefault}
          </span>
        </div>
      )}
    </div>
  );
}
