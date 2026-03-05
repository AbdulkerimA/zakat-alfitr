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

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/mesakin/register', label: 'Register Mesakin', icon: UserPlus },
  { href: '/dashboard/muzaki/register', label: 'Register Muzaki', icon: HandCoins },
  { href: '/dashboard/mesakin', label: 'Mesakin List', icon: Users },
  { href: '/dashboard/muzaki', label: 'Muzaki List', icon: List },
  { href: '/dashboard/distributions', label: 'Distributions', icon: Package },
  { href: '/dashboard/config', label: 'Settings', icon: Settings },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <aside className="fixed bottom-4 left-1/2 -translate-x-1/2 md:static md:translate-x-0 md:w-64 md:min-h-screen z-50">
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