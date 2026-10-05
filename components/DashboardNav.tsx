'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  HandCoins,
  Settings,
  List,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

export function DashboardNav() {
  const pathname = usePathname();
  const t = useTranslations('nav');

  const navItems = [
    { href: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { href: '/dashboard/mesakin/register', label: t('registerMesakin'), icon: UserPlus },
    { href: '/dashboard/muzaki/register', label: t('registerMuzaki'), icon: HandCoins },
    { href: '/dashboard/mesakin', label: t('mesakinList'), icon: Users },
    { href: '/dashboard/muzaki', label: t('muzakiList'), icon: List },
    { href: '/dashboard/config', label: t('settings'), icon: Settings },
  ];

  // The most specific matching item wins, so /dashboard/mesakin/123 highlights
  // "Mesakin list" and /dashboard/mesakin/register highlights "Register".
  const activeHref = navItems
    .filter(
      (item) =>
        pathname === item.href ||
        (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'))
    )
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <aside
      className={cn(
        // Mobile: floating pill at the bottom of the screen
        'fixed bottom-4 left-1/2 z-50 -translate-x-1/2',
        // Desktop: sticky sidebar under the header
        'md:sticky md:bottom-auto md:left-auto md:top-16 md:h-[calc(100vh-4rem)] md:w-64 md:shrink-0 md:translate-x-0 md:self-start md:bg-white/60'
      )}
    >
      <nav
        className={cn(
          'flex items-start justify-center gap-1 rounded-full border border-green-100 bg-white/90 p-2 shadow-xl shadow-green-900/10 backdrop-blur-md',
          'md:h-full md:flex-col md:justify-start md:gap-1 md:rounded-none md:border-0 md:border-r md:bg-transparent md:p-4 md:shadow-none md:backdrop-blur-none'
        )}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === activeHref;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex items-center justify-center gap-3 rounded-full p-3 text-sm font-medium transition-colors',
                'md:justify-start md:rounded-lg md:px-3 md:py-2.5',
                isActive
                  ? 'bg-green-600 text-white shadow-sm shadow-green-600/30 md:bg-green-50 md:text-green-800 md:shadow-none md:ring-1 md:ring-green-200'
                  : 'text-gray-500 hover:bg-green-50 hover:text-green-700 md:text-gray-600'
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5 shrink-0 md:h-4 md:w-4',
                  isActive ? 'md:text-green-600' : ''
                )}
              />
              <span className="hidden md:inline">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}