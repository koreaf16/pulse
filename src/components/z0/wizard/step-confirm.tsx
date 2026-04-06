/**
 * ============================================================================
 * @file        step-confirm.tsx
 * @description Add Source 위자드 Step 4 — 설정 최종 확인 및 저장.
 * @zone        Z0
 * @domain      System
 *
 * @dependencies @/app/z0/add/page (WizardState type)
 * @called_by   z0/add/page
 * @feeds_to    -
 *
 * @strict_rule 300라인 제한 준수.
 * ============================================================================
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { WizardState } from '@/app/z0/add/page';

interface StepConfirmProps {
  wizardState: WizardState;
  onBack: () => void;
}

export function StepConfirm({ wizardState, onBack }: StepConfirmProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();
  const { provider, config, credential } = wizardState;

  async function handleSave() {
    setSaving(true);
    // Mock: 1.5초 지연 후 성공
    await new Promise((r) => setTimeout(r, 1500));
    setSaving(false);
    setSaved(true);
    // 2초 후 /z0으로 이동
    setTimeout(() => router.push('/z0'), 2000);
  }

  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
        <div className="h-16 w-16 rounded-full bg-[#E8FBF6] flex items-center justify-center">
          <svg className="h-8 w-8 text-[#00B894]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-[#1A1D23]">Source Added!</h3>
        <p className="text-sm text-[#636E72]">
          {provider?.name} 소스가 등록되었습니다. Source Manager로 이동합니다...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[#1A1D23]">Confirm & Save</h2>
        <p className="mt-1 text-sm text-[#636E72]">설정을 확인하고 저장하세요.</p>
      </div>

      {/* Summary */}
      <div className="rounded-xl border border-[#E8ECEF] divide-y divide-[#E8ECEF]">
        {/* Provider */}
        <div className="flex items-center justify-between px-5 py-3">
          <span className="text-sm text-[#636E72]">Provider</span>
          <span className="text-sm font-semibold text-[#1A1D23]">{provider?.name}</span>
        </div>

        {/* Config fields */}
        {Object.entries(config).map(([key, value]) => (
          <div key={key} className="flex items-start justify-between px-5 py-3">
            <span className="text-sm text-[#636E72] capitalize">{key}</span>
            <span className="text-sm font-medium text-[#1A1D23] text-right max-w-[60%]">
              {Array.isArray(value) ? value.join(', ') : String(value)}
            </span>
          </div>
        ))}

        {/* Credentials (masked) */}
        {Object.keys(credential).length > 0 && (
          <div className="flex items-center justify-between px-5 py-3">
            <span className="text-sm text-[#636E72]">Credentials</span>
            <span className="font-data text-sm text-[#636E72]">
              {Object.keys(credential).length} key(s) — encrypted
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="rounded-xl bg-[#EBF5FF] border border-[#0984E3]/20 p-4 text-xs text-[#0984E3]">
        저장 후 소스는 즉시 활성화되어 데이터 수집을 시작합니다. Source Manager에서 언제든 비활성화할 수 있습니다.
      </div>

      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          disabled={saving}
          className="rounded-lg border border-[#E8ECEF] px-5 py-2.5 text-sm font-medium text-[#636E72] hover:bg-[#F5F6FA] disabled:opacity-40"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-[#00B894] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#00A37D] disabled:opacity-60 transition-colors"
        >
          {saving ? (
            <>
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving...
            </>
          ) : (
            'Save Source'
          )}
        </button>
      </div>
    </div>
  );
}
