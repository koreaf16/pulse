/**
 * ============================================================================
 * @file        step-credential.tsx
 * @description Add Source 위자드 Step 3 — API Key/Secret 입력 필드.
 * @zone        Z0
 * @domain      System
 *
 * @dependencies @/lib/dummy-data/providers
 * @called_by   z0/add/page
 * @feeds_to    -
 *
 * @strict_rule 300라인 제한 준수.
 * ============================================================================
 */
'use client';

import { useState } from 'react';
import type { ProviderCatalogItem } from '@/lib/providers-catalog';

interface CredentialField {
  key: string;
  label: string;
  placeholder: string;
  required: boolean;
}

const CREDENTIAL_FIELDS: Record<string, CredentialField[]> = {
  binance: [
    { key: 'apiKey', label: 'API Key', placeholder: 'Enter Binance API Key', required: true },
    { key: 'apiSecret', label: 'API Secret', placeholder: 'Enter Binance API Secret', required: true },
  ],
  fred: [
    { key: 'apiKey', label: 'FRED API Key', placeholder: 'Enter FRED API Key (free at fred.stlouisfed.org)', required: true },
  ],
  coingecko: [
    { key: 'apiKey', label: 'API Key (optional)', placeholder: 'Leave blank for free tier', required: false },
  ],
  rss: [],  // No credentials needed
  yahoo: [],  // No credentials needed
};

interface StepCredentialProps {
  provider: ProviderCatalogItem;
  credential: Record<string, string>;
  onChange: (c: Record<string, string>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepCredential({
  provider, credential, onChange, onNext, onBack,
}: StepCredentialProps) {
  const [localCred, setLocalCred] = useState<Record<string, string>>(credential);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const fields = CREDENTIAL_FIELDS[provider.id] ?? [];

  function updateField(key: string, value: string) {
    const updated = { ...localCred, [key]: value };
    setLocalCred(updated);
    onChange(updated);
  }

  const isValid = fields
    .filter((f) => f.required)
    .every((f) => (localCred[f.key] ?? '').trim().length > 0);

  if (fields.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-[#1A1D23]">Credentials</h2>
          <p className="mt-1 text-sm text-[#636E72]">
            {provider.name}은 API 인증이 필요하지 않습니다.
          </p>
        </div>
        <div className="rounded-xl bg-[#E8FBF6] p-4 flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-[#00B894] flex items-center justify-center flex-shrink-0">
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm text-[#00B894] font-medium">인증 불필요 — 바로 다음 단계로 진행합니다.</p>
        </div>
        <div className="flex justify-between pt-2">
          <button type="button" onClick={onBack}
            className="rounded-lg border border-[#E8ECEF] px-5 py-2.5 text-sm font-medium text-[#636E72] hover:bg-[#F5F6FA]">
            ← Back
          </button>
          <button type="button" onClick={onNext}
            className="rounded-lg bg-[#0984E3] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#0773C5]">
            Next: Confirm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[#1A1D23]">Credentials</h2>
        <p className="mt-1 text-sm text-[#636E72]">
          {provider.name} API 자격증명을 입력하세요. 암호화 저장됩니다.
        </p>
      </div>

      <div className="rounded-xl bg-[#FFF8E6] border border-[#FDCB6E]/40 p-3 text-xs text-[#E17055]">
        ⚠️ 자격증명은 서버 환경변수로 저장되며 UI에 다시 표시되지 않습니다.
      </div>

      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-[#1A1D23] mb-2">
              {field.label}
              {field.required && <span className="ml-1 text-[#D63031]">*</span>}
            </label>
            <div className="relative">
              <input
                type={showSecrets[field.key] ? 'text' : 'password'}
                value={localCred[field.key] ?? ''}
                placeholder={field.placeholder}
                onChange={(e) => updateField(field.key, e.target.value)}
                className="w-full rounded-lg border border-[#E8ECEF] bg-white px-3 py-2 pr-10 text-sm font-data text-[#1A1D23] placeholder-[#B2BEC3] focus:border-[#0984E3] focus:outline-none focus:ring-2 focus:ring-[#EBF5FF]"
              />
              <button
                type="button"
                onClick={() => setShowSecrets(p => ({ ...p, [field.key]: !p[field.key] }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B2BEC3] hover:text-[#636E72]"
              >
                {showSecrets[field.key] ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-2">
        <button type="button" onClick={onBack}
          className="rounded-lg border border-[#E8ECEF] px-5 py-2.5 text-sm font-medium text-[#636E72] hover:bg-[#F5F6FA]">
          ← Back
        </button>
        <button type="button" onClick={onNext} disabled={!isValid}
          className="rounded-lg bg-[#0984E3] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#0773C5] disabled:opacity-40 disabled:cursor-not-allowed">
          Next: Confirm
        </button>
      </div>
    </div>
  );
}
