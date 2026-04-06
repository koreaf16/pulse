'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ZONE_COLORS, NAV_ITEMS } from '@/lib/design-tokens';
import { ETClock } from './et-clock';

export function Sidebar() {
  const pathname = usePathname() ?? '/';

  const z0SubNav = [
    { href: '/z0', label: 'Overview' },
    { href: '/z0/explore', label: 'Explorer' },
    { href: '/z0/add', label: 'Add source' },
  ];

  function isActive(href: string): boolean {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  return (
    <aside className="flex h-screen w-[240px] flex-col border-r border-[#E8ECEF] bg-white">
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-[#E8ECEF]">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1A1D23]">
          <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-[#1A1D23] leading-none">Pulse</p>
          <p className="text-[10px] text-[#636E72] mt-0.5">Trading Pipeline</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-widest text-[#B2BEC3]">Navigation</p>

        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          const zoneColor = item.zone ? ZONE_COLORS[item.zone].primary : '#1A1D23';

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors group',
                active ? 'bg-[#F5F6FA] text-[#1A1D23]' : 'text-[#636E72] hover:bg-[#FAFBFC] hover:text-[#1A1D23]'
              )}
            >
              <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: zoneColor }} />
              <div className="flex-1 min-w-0">
                <p className={cn('text-sm font-medium leading-none', active && 'text-[#1A1D23]')}>{item.label}</p>
                <p className={cn('text-[11px] mt-0.5 leading-none', active ? 'text-[#636E72]' : 'text-[#B2BEC3]')}>
                  {item.description}
                </p>
              </div>
              {active && <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: zoneColor }} />}
            </Link>
          );
        })}

        {pathname.startsWith('/z0') && (
          <div className="pl-7 pt-1 space-y-0.5">
            {z0SubNav.map((sub) => {
              const subActive = pathname === sub.href;
              return (
                <Link
                  key={sub.href}
                  href={sub.href}
                  className={cn(
                    'block rounded-md px-3 py-1.5 text-xs transition-colors',
                    subActive ? 'bg-[#EBF5FF] text-[#0984E3] font-medium' : 'text-[#636E72] hover:text-[#1A1D23]'
                  )}
                >
                  {sub.label}
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      <ETClock />
    </aside>
  );
}
