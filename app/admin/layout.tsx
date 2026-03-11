// app/admin/layout.tsx
'use client';

import { SuperAdminProvider } from '@/contexts/SuperAdminContext';
import { Toaster } from 'sonner';

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SuperAdminProvider>
      {children}
      <Toaster position="top-right" richColors />
    </SuperAdminProvider>
  );
}