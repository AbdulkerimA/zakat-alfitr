'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardNav } from '@/components/DashboardNav';
import { DashboardHeader } from '@/components/DashboardHeader';
import { NextIntlClientProvider } from 'next-intl';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<any>(null);
  const [locale, setLocale] = useState('en');

  useEffect(() => {
    const loadMessages = async () => {
      const cookieLocale = document.cookie
        .split('; ')
        .find(row => row.startsWith('locale='))
        ?.split('=')[1] || 'en';
      
      setLocale(cookieLocale);
      const msgs = await import(`../../messages/${cookieLocale}.json`);
      setMessages(msgs.default);
    };
    loadMessages();

    // Listen for storage events to detect cookie changes from LanguageSwitcher
    const handleStorageChange = () => {
      loadMessages();
    };
    window.addEventListener('languageChange', handleStorageChange);
    return () => window.removeEventListener('languageChange', handleStorageChange);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !messages) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <div className="flex flex-col md:flex-row">
          <DashboardNav />
          <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">{children}</main>
        </div>
      </div>
    </NextIntlClientProvider>
  );
}