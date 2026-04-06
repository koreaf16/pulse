/**
 * ============================================================================
 * @file        step-config.tsx
 * @description Add Source 위자드 Step 2 — 프로바이더별 설정 필드 입력.
 * @zone        Z0
 * @domain      System
 *
 * @dependencies @/lib/dummy-data/providers, @/lib/utils
 * @called_by   z0/add/page
 * @feeds_to    -
 *
 * @strict_rule 300라인 제한 준수.
 * ============================================================================
 */
'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { ProviderCatalogItem, ConfigField } from '@/lib/providers-catalog';

interface StepConfigProps {
  provider: ProviderCatalogItem;
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepConfig({ provider, config, onChange, onNext, onBack }: StepConfigProps) {
  const [localConfig, setLocalConfig] = useState<Record<string, unknown>>(config);

  function updateField(key: string, value: unknown) {
    const updated = { ...localConfig, [key]: value };
    setLocalConfig(updated);
    onChange(updated);
  }

  function toggleMultiSelect(key: string, value: string) {
    const current = (localConfig[key] as string[]) ?? [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateField(key, updated);
  }

  function renderField(field: ConfigField) {
    if (field.type === 'multiselect' && field.options) {
      const selected = (localConfig[field.key] as string[]) ?? [];
      return (
        <div className="flex flex-wrap gap-2">
          {field.options.map((opt) => {
            const isSelected = selected.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleMultiSelect(field.key, opt.value)}
                className={cn(
                  'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
                  isSelected
                    ? 'border-[#0984E3] bg-[#EBF5FF] text-[#0984E3]'
                    : 'border-[#E8ECEF] bg-white text-[#636E72] hover:border-[#0984E3]/40'
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      );
    }

    if (field.type === 'number') {
      return (
        <input
          type="number"
          value={(localConfig[field.key] as string) ?? ''}
          placeholder={field.placeholder}
          onChange={(e) => updateField(field.key, e.target.value)}
          className="w-full rounded-lg border border-[#E8ECEF] bg-white px-3 py-2 text-sm text-[#1A1D23] placeholder-[#B2BEC3] focus:border-[#0984E3] focus:outline-none focus:ring-2 focus:ring-[#EBF5FF]"
        />
      );
    }

    return (
      <input
        type="text"
        value={(localConfig[field.key] as string) ?? ''}
        placeholder={field.placeholder}
        onChange={(e) => updateField(field.key, e.target.value)}
        className="w-full rounded-lg border border-[#E8ECEF] bg-white px-3 py-2 text-sm text-[#1A1D23] placeholder-[#B2BEC3] focus:border-[#0984E3] focus:outline-none focus:ring-2 focus:ring-[#EBF5FF]"
      />
    );
  }

  const isValid = provider.configFields
    .filter((f) => f.required)
    .every((f) => {
      const v = localConfig[f.key];
      if (Array.isArray(v)) return v.length > 0;
      return v !== undefined && v !== '';
    });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[#1A1D23]">Configure Source</h2>
        <p className="mt-1 text-sm text-[#636E72]">
          {provider.name} 소스 설정을 입력하세요.
        </p>
      </div>

      <div className="space-y-5">
        {provider.configFields.map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-[#1A1D23] mb-2">
              {field.label}
              {field.required && <span className="ml-1 text-[#D63031]">*</span>}
            </label>
            {renderField(field)}
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-[#E8ECEF] px-5 py-2.5 text-sm font-medium text-[#636E72] hover:bg-[#F5F6FA] transition-colors"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!isValid}
          className="inline-flex items-center gap-2 rounded-lg bg-[#0984E3] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0773C5] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next: Credentials
        </button>
      </div>
    </div>
  );
}
