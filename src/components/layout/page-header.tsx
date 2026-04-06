import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { Zone } from '@/types/common';
import { ZONE_COLORS } from '@/lib/design-tokens';

interface PageHeaderProps {
  title: string;
  description?: string;
  zone?: Zone;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, zone, actions, className }: PageHeaderProps) {
  const zoneColor = zone ? ZONE_COLORS[zone].primary : undefined;

  return (
    <div className={cn('flex flex-wrap items-start justify-between gap-3', className)}>
      <div className="flex items-start gap-2.5">
        {zone && (
          <div
            className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: ZONE_COLORS[zone].light }}
          >
            <span className="text-[11px] font-bold" style={{ color: zoneColor }}>
              {zone}
            </span>
          </div>
        )}
        <div>
          <h1 className="text-lg font-bold text-[#1A1D23] leading-tight md:text-[19px]">{title}</h1>
          {description && <p className="mt-1 text-[13px] leading-5 text-[#636E72]">{description}</p>}
        </div>
      </div>

      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  );
}
