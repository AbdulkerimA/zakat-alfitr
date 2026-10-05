'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useMasjid } from '@/contexts/MasjidContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Building, LogOut } from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useTranslations } from 'next-intl';

export function DashboardHeader() {
  const { user, logout } = useAuth();
  const { masjid } = useMasjid();
  const t = useTranslations('common');

  const initials = user?.email?.charAt(0).toUpperCase() || 'U';

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-green-100/80 bg-white/80 px-4 backdrop-blur-md md:h-16 md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-600 text-white shadow-sm md:h-9 md:w-9">
          <Building className="h-4 w-4 md:h-5 md:w-5" />
        </span>
        <h1 className="truncate text-base font-semibold tracking-tight text-green-900 md:text-lg">
          {masjid?.name || t('loading')}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <LanguageSwitcher />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-9 w-9 rounded-full p-0 ring-1 ring-green-200 transition hover:ring-green-400 focus-visible:ring-2 focus-visible:ring-green-500"
              aria-label={user?.email ?? 'User menu'}
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-green-100 text-sm font-medium text-green-700">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60 rounded-xl border-green-100 p-1.5">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-0.5">
                <span className="truncate text-sm font-medium text-gray-900">
                  {user?.email}
                </span>
                <span className="truncate text-xs text-gray-500">{masjid?.name}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => logout()}
              className="cursor-pointer rounded-lg text-gray-700 focus:bg-green-50 focus:text-green-800"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {t('logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}