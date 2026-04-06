/**
 * ============================================================================
 * @file        step-indicator.tsx
 * @description 위자드 단계 진행 표시 컴포넌트.
 * @zone        INFRA
 * @domain      System
 *
 * @dependencies @/lib/utils
 * @called_by   z0/add/page
 * @feeds_to    -
 *
 * @strict_rule 300라인 제한 준수.
 * ============================================================================
 */
import { cn } from '@/lib/utils';

export interface WizardStep {
  index: number;
  label: string;
}

interface StepIndicatorProps {
  steps: WizardStep[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((step, idx) => {
        const isDone = step.index < currentStep;
        const isActive = step.index === currentStep;

        return (
          <div key={step.index} className="flex items-center">
            {/* Step node */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                  isDone && 'bg-[#0984E3] text-white',
                  isActive && 'bg-[#0984E3] text-white ring-4 ring-[#EBF5FF]',
                  !isDone && !isActive && 'bg-[#E8ECEF] text-[#636E72]'
                )}
              >
                {isDone ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                      d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.index + 1
                )}
              </div>
              <span
                className={cn(
                  'mt-1 text-[11px] font-medium whitespace-nowrap',
                  isActive ? 'text-[#0984E3]' : isDone ? 'text-[#636E72]' : 'text-[#B2BEC3]'
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {idx < steps.length - 1 && (
              <div
                className={cn(
                  'h-0.5 w-16 mb-5 transition-colors',
                  step.index < currentStep ? 'bg-[#0984E3]' : 'bg-[#E8ECEF]'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
