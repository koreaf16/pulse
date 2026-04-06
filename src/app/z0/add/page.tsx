'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { StepIndicator } from '@/components/ui/step-indicator';
import { StepProvider } from '@/components/z0/wizard/step-provider';
import { StepConfig } from '@/components/z0/wizard/step-config';
import { StepCredential } from '@/components/z0/wizard/step-credential';
import { StepConfirm } from '@/components/z0/wizard/step-confirm';
import type { ProviderCatalogItem } from '@/lib/providers-catalog';

const WIZARD_STEPS = [
  { index: 0, label: 'Provider' },
  { index: 1, label: 'Config' },
  { index: 2, label: 'Credentials' },
  { index: 3, label: 'Confirm' },
];

export interface WizardState {
  provider: ProviderCatalogItem | null;
  config: Record<string, unknown>;
  credential: Record<string, string>;
}

export default function AddSourcePage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardState, setWizardState] = useState<WizardState>({
    provider: null,
    config: {},
    credential: {},
  });

  function handleNext() {
    setCurrentStep((s) => Math.min(s + 1, WIZARD_STEPS.length - 1));
  }

  function handleBack() {
    setCurrentStep((s) => Math.max(s - 1, 0));
  }

  function updateWizard(patch: Partial<WizardState>) {
    setWizardState((prev) => ({ ...prev, ...patch }));
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <PageHeader
        title="Add Z0 Source"
        description="Register a new raw data collector."
        zone="Z0"
        actions={
          <Link href="/z0" className="text-sm text-[#636E72] hover:text-[#1A1D23] transition-colors">
            Back to sources
          </Link>
        }
      />

      <div className="flex justify-center">
        <StepIndicator steps={WIZARD_STEPS} currentStep={currentStep} />
      </div>

      <div className="rounded-xl bg-white p-8 shadow-sm">
        {currentStep === 0 && (
          <StepProvider
            selected={wizardState.provider}
            onSelect={(p) => updateWizard({ provider: p })}
            onNext={handleNext}
          />
        )}
        {currentStep === 1 && wizardState.provider && (
          <StepConfig
            provider={wizardState.provider}
            config={wizardState.config}
            onChange={(config) => updateWizard({ config })}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}
        {currentStep === 2 && wizardState.provider && (
          <StepCredential
            provider={wizardState.provider}
            credential={wizardState.credential}
            onChange={(credential) => updateWizard({ credential })}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}
        {currentStep === 3 && wizardState.provider && <StepConfirm wizardState={wizardState} onBack={handleBack} />}
      </div>
    </div>
  );
}
