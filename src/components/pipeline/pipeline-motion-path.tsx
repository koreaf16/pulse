/**
 * ============================================================================
 * @file        pipeline-motion-path.tsx
 * @description Pipeline SVG path 한 줄의 공통 애니메이션과 endpoint marker를 렌더링하는 컴포넌트.
 * @zone        INFRA
 * @domain      System
 *
 * [Architecture Context & Correlation]
 * @dependencies react
 * @called_by   components/pipeline/pipeline-pipe.tsx,
 *              components/pipeline/pipeline-stage-flow.tsx,
 *              components/pipeline/pipeline-tier-one-flow.tsx
 * @feeds_to    -
 *
 * @strict_rule
 *   1. 300라인 제한 준수.
 *   2. 시각 효과와 SVG 애니메이션만 포함.
 *   3. 데이터 조회나 비즈니스 규칙 포함 금지.
 * ============================================================================
 */
'use client';

import { useId } from 'react';

interface EndpointMarker {
  x: number;
  y: number;
  radius?: number;
  opacity?: number;
}

interface PipelineMotionPathProps {
  pathData: string;
  color: string;
  active?: boolean;
  duration?: number;
  packetDelays?: number[];
  variant?: 'default' | 'subtle';
  backgroundOpacity?: number;
  coreOpacity?: number;
  dashedOpacity?: number;
  start?: EndpointMarker;
  end?: EndpointMarker;
}

const DEFAULT_PACKET_DELAYS = [0, 0.4, 0.8];

export function PipelineMotionPath({
  pathData,
  color,
  active = true,
  duration = 1.6,
  packetDelays = DEFAULT_PACKET_DELAYS,
  variant = 'default',
  backgroundOpacity = 1,
  coreOpacity = 0.72,
  dashedOpacity = 0.5,
  start,
  end,
}: PipelineMotionPathProps) {
  const motionId = useId().replace(/:/g, '');
  const gradientId = `pipe-grad-${motionId}`;
  const glowId = `pipe-glow-${motionId}`;
  const isSubtle = variant === 'subtle';
  const backgroundWidth = isSubtle ? 2.5 : 3;
  const coreWidth = isSubtle ? 0.7 : 0.8;
  const outerPacketRadius = isSubtle ? 2.2 : 2.5;
  const innerPacketRadius = isSubtle ? 1.2 : 1.4;
  const startRadius = start?.radius ?? (isSubtle ? 2 : 2.4);
  const endRadius = end?.radius ?? (isSubtle ? 2 : 2.4);

  return (
    <g>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0.1" />
          <stop offset="50%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0.8" />
        </linearGradient>
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={isSubtle ? 2.2 : 3} result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <path
        d={pathData}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={backgroundWidth}
        opacity={backgroundOpacity}
        strokeLinecap="round"
      />
      <path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth={coreWidth}
        opacity={coreOpacity}
        strokeLinecap="round"
      />
      <path
        d={pathData}
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeDasharray="4 12"
        opacity={active ? dashedOpacity : 0}
        strokeLinecap="round"
      >
        {active && (
          <animate
            attributeName="stroke-dashoffset"
            from="16"
            to="0"
            dur="0.6s"
            repeatCount="indefinite"
          />
        )}
      </path>

      {active &&
        packetDelays.map((delay) => (
          <g key={`${motionId}-${delay}`}>
            <circle r={outerPacketRadius} fill="#FFFFFF" filter={`url(#${glowId})`} opacity="0.92">
              <animateMotion
                dur={`${duration}s`}
                begin={`${delay * duration}s`}
                repeatCount="indefinite"
                path={pathData}
                calcMode="linear"
              />
            </circle>
            <circle r={innerPacketRadius} fill={color}>
              <animateMotion
                dur={`${duration}s`}
                begin={`${delay * duration}s`}
                repeatCount="indefinite"
                path={pathData}
                calcMode="linear"
              />
            </circle>
          </g>
        ))}

      {start && (
        <circle
          cx={start.x}
          cy={start.y}
          r={startRadius}
          fill={color}
          opacity={start.opacity ?? Math.max(coreOpacity, 0.35)}
        />
      )}
      {end && (
        <circle
          cx={end.x}
          cy={end.y}
          r={endRadius}
          fill={color}
          opacity={end.opacity ?? Math.max(coreOpacity, 0.45)}
        />
      )}
    </g>
  );
}
