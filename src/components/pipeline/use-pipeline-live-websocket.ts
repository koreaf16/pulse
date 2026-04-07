/**
 * ============================================================================
 * @file        use-pipeline-live-websocket.ts
 * @description Pipeline 라이브 모니터 WebSocket 연결과 재연결을 관리하는 훅.
 * @zone        INFRA
 * @domain      System
 *
 * [Architecture Context & Correlation]
 * @dependencies react
 * @called_by    frontend/src/components/pipeline/pipeline-live-view.tsx
 * @feeds_to     frontend/src/components/pipeline/pipeline-live-view.tsx
 *
 * @strict_rule
 *   1. 300라인 제한 준수.
 *   2. UI 렌더링 없이 연결과 이벤트 반영만 담당.
 *   3. 브라우저 WebSocket error 이벤트는 close 흐름으로 복구 처리.
 * ============================================================================
 */
import { useEffect, type RefObject } from 'react';

const PIPELINE_WS_PORT = 2002;
const WS_RECONNECT_BASE_MS = 1000;
const WS_RECONNECT_MAX_MS = 10000;

function getPipelineWsUrl(): string {
  if (typeof window === 'undefined') return `ws://127.0.0.1:${PIPELINE_WS_PORT}`;
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  return `${protocol}://${window.location.hostname}:${PIPELINE_WS_PORT}`;
}

function applyPipelineEvent(
  type: string,
  payload: Record<string, string>,
  z0EventRef: RefObject<HTMLSpanElement | null>,
  z1EventRef: RefObject<HTMLSpanElement | null>,
  z2EventRef: RefObject<HTMLSpanElement | null>,
): void {
  const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });

  if ((type === 'candle_closed' || type === 'liquidation' || type === 'news_collected') && z0EventRef.current) {
    z0EventRef.current.textContent = `${type.replaceAll('_', ' ')}: ${payload?.symbol ?? ''} @ ${timeStr}`;
    return;
  }

  if (type === 'features_computed' && z1EventRef.current) {
    z1EventRef.current.textContent = `features computed @ ${timeStr}`;
    return;
  }

  if ((type === 'global_context_generated' || type === 'local_context_generated') && z2EventRef.current) {
    const label = type === 'global_context_generated' ? 'global' : `local ${payload?.symbol ?? ''}`;
    z2EventRef.current.textContent = `context built (${label}) @ ${timeStr}`;
  }
}

export function usePipelineLiveWebsocket(
  z0EventRef: RefObject<HTMLSpanElement | null>,
  z1EventRef: RefObject<HTMLSpanElement | null>,
  z2EventRef: RefObject<HTMLSpanElement | null>,
): void {
  useEffect(() => {
    let disposed = false;
    let intentionalClose = false;
    let ws: WebSocket | null = null;
    let reconnectTimeout: number | null = null;
    let reconnectAttempt = 0;

    const clearReconnect = () => {
      if (reconnectTimeout != null) {
        window.clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }
    };

    const scheduleReconnect = () => {
      if (disposed || reconnectTimeout != null) return;
      const delay = Math.min(WS_RECONNECT_BASE_MS * (2 ** reconnectAttempt), WS_RECONNECT_MAX_MS);
      reconnectAttempt += 1;
      reconnectTimeout = window.setTimeout(() => {
        reconnectTimeout = null;
        connect();
      }, delay);
    };

    const connect = () => {
      if (disposed) return;
      ws = new WebSocket(getPipelineWsUrl());
      intentionalClose = false;

      ws.onopen = () => {
        reconnectAttempt = 0;
      };

      ws.onmessage = (event) => {
        try {
          const { type, payload } = JSON.parse(event.data) as { type: string; payload: Record<string, string> };
          applyPipelineEvent(type, payload, z0EventRef, z1EventRef, z2EventRef);
        } catch (err) {
          console.error('WS message error:', err);
        }
      };

      ws.onerror = () => {
        // Browser error events do not expose useful details.
      };

      ws.onclose = (event) => {
        ws = null;
        if (disposed || intentionalClose || event.code === 1000) return;
        scheduleReconnect();
      };
    };

    connect();

    return () => {
      disposed = true;
      intentionalClose = true;
      clearReconnect();
      if (!ws) return;
      const current = ws;
      ws = null;
      if (current.readyState === WebSocket.OPEN || current.readyState === WebSocket.CONNECTING) {
        current.close(1000, 'pipeline_live_view_cleanup');
      }
    };
  }, [z0EventRef, z1EventRef, z2EventRef]);
}
