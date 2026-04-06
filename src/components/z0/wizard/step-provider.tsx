/**
 * ============================================================================
 * @file        step-provider.tsx
 * @description Add Source 위자드 Step 1 — 프로바이더 선택 카드 그리드.
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
import { cn } from '@/lib/utils';
import { PROVIDER_CATALOG, type ProviderCatalogItem } from '@/lib/providers-catalog';

interface StepProviderProps {
  selected: ProviderCatalogItem | null;
  onSelect: (p: ProviderCatalogItem) => void;
  onNext: () => void;
}

export function StepProvider({ selected, onSelect, onNext }: StepProviderProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[#1A1D23]">Select Provider</h2>
        <p className="mt-1 text-sm text-[#636E72]">
          데이터를 수집할 프로바이더를 선택하세요.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {PROVIDER_CATALOG.map((provider) => {
          const isSelected = selected?.id === provider.id;
          return (
            <button
              key={provider.id}
              type="button"
              onClick={() => onSelect(provider)}
              className={cn(
                'flex items-start gap-4 rounded-xl border-2 p-4 text-left transition-all',
                isSelected
                  ? 'border-[#0984E3] bg-[#EBF5FF]'
                  : 'border-[#E8ECEF] bg-white hover:border-[#0984E3]/40 hover:bg-[#FAFBFC]'
              )}
            >
              {/* Logo */}
              <div
                className="mt-0.5 h-10 w-10 flex-shrink-0 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                style={{ backgroundColor: provider.logoColor }}
              >
                {provider.name.slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1A1D23]">{provider.name}</p>
                <p className="mt-0.5 text-[11px] text-[#636E72] leading-snug">
                  {provider.description}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {provider.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-[#F5F6FA] px-1.5 py-0.5 text-[10px] text-[#636E72]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              {isSelected && (
                <div className="flex-shrink-0 mt-0.5">
                  <div className="h-5 w-5 rounded-full bg-[#0984E3] flex items-center justify-center">
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onNext}
          disabled={!selected}
          className="inline-flex items-center gap-2 rounded-lg bg-[#0984E3] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0773C5] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next: Configure
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
