import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { MasjidProvider } from '@/contexts/MasjidContext';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Zakat Management System',
  description: 'Manage Zakat al-Fitr collection and distribution',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <MasjidProvider>
            {children}
            <Toaster />
          </MasjidProvider>
        </AuthProvider>
      </body>
    </html>
  );
}