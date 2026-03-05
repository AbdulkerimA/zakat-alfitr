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
import { LogOut, User } from 'lucide-react';

export function DashboardHeader() {
  const { user, logout } = useAuth();
  const { masjid } = useMasjid();

  const initials = user?.email?.charAt(0).toUpperCase() || 'U';

  return (
    <header className="bg-white border-b h-14 md:h-16 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-2">
        <h1 className="font-semibold text-base md:text-lg truncate">{masjid?.name || 'Loading...'}</h1>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-green-100 text-green-700">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="text-sm">{user?.email}</span>
              <span className="text-xs text-gray-500">{masjid?.name}</span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => logout()}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}