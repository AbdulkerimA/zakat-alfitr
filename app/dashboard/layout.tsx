'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardNav } from '@/components/DashboardNav';
import { DashboardHeader } from '@/components/DashboardHeader';
import { NextIntlClientProvider } from 'next-intl';
import { Building } from 'lucide-react';

type Messages = Record<string, unknown>;

function getCookieLocale() {
  return (
    document.cookie
      .split('; ')
      .find((row) => row.startsWith('locale='))
      ?.split('=')[1] || 'en'
  );
}

function FullScreenLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 bg-linear-to-b from-green-50 to-white">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-600 text-white shadow-lg shadow-green-600/25">
        <Building className="h-6 w-6" />
      </span>
      <div
        role="status"
        aria-label="Loading"
        className="h-6 w-6 animate-spin rounded-full border-2 border-green-200 border-t-green-600"
      />
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Messages | null>(null);
  const [locale, setLocale] = useState('en');

  const loadMessages = useCallback(async () => {
    const cookieLocale = getCookieLocale();
    try {
      const msgs = await import(`../../messages/${cookieLocale}.json`);
      setLocale(cookieLocale);
      setMessages(msgs.default);
    } catch {
      // Fall back to English if the requested locale file is missing
      const msgs = await import('../../messages/en.json');
      setLocale('en');
      setMessages(msgs.default);
    }
  }, []);

  useEffect(() => {
    loadMessages();

    // Fired by LanguageSwitcher when the locale cookie changes
    window.addEventListener('languageChange', loadMessages);
    return () => window.removeEventListener('languageChange', loadMessages);
  }, [loadMessages]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading || !messages) {
    return <FullScreenLoader />;
  }

  if (!user) {
    return null;
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="relative min-h-screen bg-gray-50/80">
        {/* Soft green glow behind the content, matching the landing page */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-linear-to-b from-green-50 to-transparent"
        />

        <div className="sticky top-0 z-40 border-b border-green-100/80 bg-white/80 backdrop-blur-md">
          <DashboardHeader />
        </div>

        <div className="relative flex flex-col md:flex-row">
          <DashboardNav />
          <main className="min-w-0 flex-1 px-4 py-6 pb-24 md:px-8 md:py-8 md:pb-8">
            <div className="mx-auto w-full max-w-6xl">{children}</div>
          </main>
        </div>
      </div>
    </NextIntlClientProvider>
  );
}