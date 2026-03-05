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
    <aside className="w-64 bg-white border-r min-h-[calc(100vh-4rem)]">
      <nav className="p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                pathname === item.href
                  ? 'bg-green-50 text-green-700'
                  : 'text-gray-600 hover:bg-gray-50'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}