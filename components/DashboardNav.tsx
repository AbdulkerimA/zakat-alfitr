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
  Package,
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

  return (
    <aside className="fixed bottom-4 md:bg-white left-1/2 -translate-x-1/2 shadow-lg md:static md:translate-x-0 md:w-64 md:min-h-[calc(100vh-4rem)] z-50">
      <nav className="bg-white rounded-full shadow-lg md:shadow-none md:rounded-none flex justify-center items-start md:justify-start md:flex-col p-2 md:p-4 gap-1 md:gap-1 md:border-r">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col md:flex-row items-center justify-center gap-1 md:gap-3 p-3 md:px-3 md:py-2 rounded-full md:rounded-lg transition-colors',
                pathname === item.href
                  ? 'bg-green-600 text-white md:bg-green-50 md:text-green-700'
                  : 'text-gray-600 hover:bg-gray-100 md:hover:bg-gray-50'
              )}
            >
              <Icon className="h-5 w-5 md:h-4 md:w-4" />
              <span className="hidden md:inline text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}