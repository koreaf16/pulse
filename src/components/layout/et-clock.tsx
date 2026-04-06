/**
 * ============================================================================
 * @file        et-clock.tsx
 * @description 현재 US Eastern Time을 실시간으로 표시하는 클라이언트 컴포넌트.
 * @zone        INFRA
 * @domain      System
 *
 * @dependencies React hooks
 * @called_by   sidebar
 * @feeds_to    -
 *
 * @strict_rule 300라인 제한 준수.
 * ============================================================================
 */
'use client';

import { useState, useEffect } from 'react';

function getETTime(): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date());
}

function getETDate(): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(new Date());
}

function isMarketOpen(): boolean {
  const now = new Date();
  const et = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: 'numeric',
    weekday: 'short',
    hour12: false,
  }).formatToParts(now);
  const weekday = et.find(p => p.type === 'weekday')?.value;
  const hour = parseInt(et.find(p => p.type === 'hour')?.value ?? '0');
  const minute = parseInt(et.find(p => p.type === 'minute')?.value ?? '0');
  const totalMin = hour * 60 + minute;
  const isWeekend = weekday === 'Sat' || weekday === 'Sun';
  return !isWeekend && totalMin >= 570 && totalMin < 960; // 09:30 ~ 16:00
}

export function ETClock() {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [marketOpen, setMarketOpen] = useState(false);

  useEffect(() => {
    function tick() {
      setTime(getETTime());
      setDate(getETDate());
      setMarketOpen(isMarketOpen());
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="px-3 py-2.5 border-t border-[#E8ECEF]">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-data text-sm font-semibold text-[#1A1D23]">{time}</p>
          <p className="text-[10px] text-[#636E72]">{date}</p>
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
            marketOpen ? 'bg-[#E8FBF6] text-[#00B894]' : 'bg-[#F5F6FA] text-[#636E72]'
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${marketOpen ? 'bg-[#00B894] animate-pulse' : 'bg-[#B2BEC3]'}`} />
          {marketOpen ? '장 열림' : '장 닫힘'}
        </span>
      </div>
      <p className="mt-0.5 text-[10px] text-[#B2BEC3]">미국 동부 시간 (ET)</p>
    </div>
  );
}
