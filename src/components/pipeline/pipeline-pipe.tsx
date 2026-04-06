/**
 * ============================================================================
 * @file        pipeline-pipe.tsx
 * @description 가로 파이프 커넥터 — SVG 기반 유기적 데이터 플로우 애니메이션 (멀티 레인 지원).
 * @zone        INFRA
 * @domain      System
 *
 * @dependencies react
 * @called_by   components/pipeline/pipeline-live-view.tsx
 * @feeds_to    -
 *
 * @strict_rule
 *   1. 300라인 제한 준수.
 *   2. 지정된 Zone 역할 외 비즈니스 로직 혼합 금지.
 *   3. SQL/타입 정의는 반드시 외부 분리 후 Import.
 * ============================================================================
 */
'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { PipelineMotionPath } from './pipeline-motion-path';
import { computeFlowParams, buildPacketDelays } from './pipeline-flow-params';

interface PipeLane {
  label: string;
  color?: string;
}

export interface PipeConnection {
  sourceIdx: number;
  targetIdx: number;
  label?: string;
  color?: string;
}

interface PipelinePipeProps {
  color: string;
  label?: string;
  lanes?: PipeLane[];
  connections?: PipeConnection[];
  sourceCount?: number;
  targetCount?: number;
  height?: number;
  className?: string;
  active?: boolean;
  origin?: 'center' | 'straight';
  sourceOffsets?: number[];
  targetOffsets?: number[];
  recentRows?: number;
}

export function PipelinePipe({
  color,
  label,
  lanes,
  connections,
  sourceCount,
  targetCount,
  height = 30,
  className = '',
  active = true,
  origin = 'straight',
  sourceOffsets,
  targetOffsets,
  recentRows,
}: PipelinePipeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgId = useId().replace(/:/g, '');
  const fallbackHeight = typeof height === 'number' ? height : 30;
  const [size, setSize] = useState({ width: 200, height: fallbackHeight });

  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateSize = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setSize({
        width: rect.width || 200,
        height: rect.height || fallbackHeight,
      });
    };

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setSize({
            width: entry.contentRect.width,
            height: entry.contentRect.height || fallbackHeight,
          });
        }
      }
    });

    observer.observe(containerRef.current);
    updateSize();

    return () => {
      observer.disconnect();
    };
  }, [fallbackHeight]);

  const activeConnections = connections || (lanes && lanes.length > 0 ? lanes.map((l, i) => ({ sourceIdx: i, targetIdx: i, label: l.label, color: l.color })) : [{ sourceIdx: 0, targetIdx: 0, label: label || '', color }]);
  const sCount = sourceCount || (lanes ? lanes.length : 1);
  const tCount = targetCount || (lanes ? lanes.length : 1);
  const width = size.width;
  const svgHeight = size.height || fallbackHeight;
  const containerStyle = typeof height === 'number' ? { minHeight: height, height: '100%' } : { height };

  const resolveGeometry = (conn: PipeConnection, index: number) => {
    const centerY = svgHeight / 2;
    const laneHeight = 36;
    const totalSourceHeight = sCount * laneHeight;
    const totalTargetHeight = tCount * laneHeight;
    const startYSource = centerY - (totalSourceHeight / 2) + (laneHeight / 2);
    const startYTarget = centerY - (totalTargetHeight / 2) + (laneHeight / 2);
    const fallbackSourceY = origin === 'center' ? centerY : startYSource + conn.sourceIdx * laneHeight;
    const fallbackTargetY = startYTarget + conn.targetIdx * laneHeight;
    const y1 = sourceOffsets?.[conn.sourceIdx] ?? fallbackSourceY;
    const y2 = targetOffsets?.[conn.targetIdx] ?? fallbackTargetY;
    const laneColor = conn.color || color;

    return {
      y1,
      y2,
      laneColor,
      duration: 1.2 + ((index * 0.17) % 0.5) + (size.width / 600),
      pathData: `M 0,${y1} C ${size.width * 0.38},${y1} ${size.width * 0.62},${y2} ${size.width},${y2}`,
    };
  };

  return (
    <div ref={containerRef} className={`relative flex w-full items-center ${className}`} style={containerStyle}>
      <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
        {activeConnections.map((conn, i) => {
          const centerY = svgHeight / 2;
          const laneHeight = 36;
          
          const totalSourceHeight = sCount * laneHeight;
          const startYSource = centerY - (totalSourceHeight / 2) + (laneHeight / 2);
          const fallbackSourceY = origin === 'center' ? centerY : startYSource + conn.sourceIdx * laneHeight;
          
          const totalTargetHeight = tCount * laneHeight;
          const startYTarget = centerY - (totalTargetHeight / 2) + (laneHeight / 2);
          const fallbackTargetY = startYTarget + conn.targetIdx * laneHeight;
          const y1 = sourceOffsets?.[conn.sourceIdx] ?? fallbackSourceY;
          const y2 = targetOffsets?.[conn.targetIdx] ?? fallbackTargetY;
          
          const laneColor = conn.color || color;
          const pathData = `M 0,${y1} C ${width * 0.38},${y1} ${width * 0.62},${y2} ${width},${y2}`;

          const flowParams = computeFlowParams(recentRows ?? 0);
          // 레인별 미세 오프셋 유지 (동시 출발 방지)
          const laneDuration = flowParams.duration + (i * 0.05);
          const isFlowing = active && flowParams.isActive;
          const packetDelays = buildPacketDelays(flowParams.packetCount);

          return (
            <g key={i}>
              <linearGradient id={`grad-${svgId}-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={laneColor} stopOpacity="0.1" />
                <stop offset="50%" stopColor={laneColor} stopOpacity="0.4" />
                <stop offset="100%" stopColor={laneColor} stopOpacity="0.8" />
              </linearGradient>

              {/* 배경 굵은 라인 */}
              <path
                d={pathData}
                fill="none"
                stroke={`url(#grad-${svgId}-${i})`}
                strokeWidth="3"
                strokeLinecap="round"
                opacity={flowParams.opacity}
              />

              {/* 코어 얇은 라인 */}
              <path
                d={pathData}
                fill="none"
                stroke={laneColor}
                strokeWidth="0.8"
                opacity={flowParams.opacity * 0.7}
                strokeLinecap="round"
              />

              {/* 흐르는 대시 라인 */}
              <path
                d={pathData}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="0.8"
                strokeDasharray="4 12"
                opacity={isFlowing ? 0.5 : 0}
                strokeLinecap="round"
              >
                {isFlowing && <animate attributeName="stroke-dashoffset" from="16" to="0" dur="0.6s" repeatCount="indefinite" />}
              </path>

              {/* 이동하는 패킷 (recentRows 기반 동적 생성) */}
              {isFlowing && packetDelays.map((delay, j) => (
                <g key={j}>
                  <circle r="2.5" fill="#FFFFFF" filter={`url(#glow-${svgId})`}>
                    <animateMotion dur={`${laneDuration}s`} begin={`${delay * laneDuration}s`} repeatCount="indefinite" path={pathData} calcMode="linear" />
                  </circle>
                  <circle r="1.4" fill={laneColor}>
                    <animateMotion dur={`${laneDuration}s`} begin={`${delay * laneDuration}s`} repeatCount="indefinite" path={pathData} calcMode="linear" />
                  </circle>
                </g>
              ))}

              {/* 노드 양 끝 */}
              <circle cx="0" cy={y1} r="2.4" fill={laneColor} />
              <circle cx={width} cy={y2} r="2.4" fill={laneColor} />
            </g>
          );
        })}
      </svg>

      {/* 라벨 렌더링 (HTML 레이어) */}
      {activeConnections.map((conn, i) => {
        if (!conn.label) return null;
        const { y1, y2, laneColor } = resolveGeometry(conn, i);
        const cy = y1 + (y2 - y1) / 2;
        return (
          <span
            key={`label-${i}`}
            className="absolute left-[50%] -translate-x-1/2 text-[9px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap z-10 shadow-sm transition-transform hover:scale-105 cursor-default"
            style={{
              top: `${cy - 20}px`,
              background: `${laneColor}15`,
              color: laneColor,
              border: `1px solid ${laneColor}40`,
              backdropFilter: 'blur(4px)',
            }}
          >
            {conn.label}
          </span>
        );
      })}
    </div>
  );
}
