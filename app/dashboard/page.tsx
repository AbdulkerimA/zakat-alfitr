'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { useMasjid } from '@/contexts/MasjidContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Wallet, Users2, Package } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface Stats {
  totalMesakin: number;
  totalMuzaki: number;
  totalCollected: number;
  pendingMesakin: number;
  supportedFamilies: number;
}

export default function DashboardPage() {
  const { masjidId } = useAuth();
  const { config } = useMasjid();
  const t = useTranslations('dashboard');
  const [stats, setStats] = useState<Stats>({
    totalMesakin: 0,
    totalMuzaki: 0,
    totalCollected: 0,
    pendingMesakin: 0,
    supportedFamilies: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!masjidId) return;

      try {
        // Get mesakin count
        const mesakinQuery = query(
          collection(db, 'mesakin'),
          where('masjidId', '==', masjidId)
        );
        const mesakinSnap = await getDocs(mesakinQuery);
        const mesakin = mesakinSnap.docs.map(doc => doc.data());
        
        // Get muzaki count and collections
        const muzakiQuery = query(
          collection(db, 'muzaki'),
          where('masjidId', '==', masjidId)
        );
        const muzakiSnap = await getDocs(muzakiQuery);
        const muzaki = muzakiSnap.docs.map(doc => doc.data());
        
        const totalCollected = muzaki.reduce((sum, m) => sum + (m.amount + m.extra || 0), 0);
        const pendingMesakin = mesakin.filter(m => m.status === 'pending').length;
        
        const onePersonPackage = config?.packageCost || 100;
        const supportedFamilies = Math.floor(totalCollected / onePersonPackage);

        setStats({
          totalMesakin: mesakin.length,
          totalMuzaki: muzaki.length,
          totalCollected,
          pendingMesakin,
          supportedFamilies,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [masjidId, config]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const cards = [
    {
      title: t('totalMesakin'),
      value: stats.totalMesakin,
      icon: Users,
      desc: t('registeredFamilies'),
    },
    {
      title: t('totalMuzaki'),
      value: stats.totalMuzaki,
      icon: Users2,
      desc: t('registeredDonors'),
    },
    {
      title: t('totalCollected'),
      value: `${stats.totalCollected} ETB`,
      icon: Wallet,
      desc: t('fromDonations'),
    },
    {
      title: t('canSupport'),
      value: stats.supportedFamilies,
      icon: Package,
      desc: `${config?.packageCost || 100} ETB ${t('each')}`,
    },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold">{t('title')}</h1>
      
      <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs md:text-sm font-medium text-gray-500">
                  {card.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-gray-500 mt-1">{card.desc}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('pendingApprovals')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{stats.pendingMesakin}</div>
            <p className="text-sm text-gray-500 mt-1">{t('mesakinWaiting')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('collectionProgress')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {stats.supportedFamilies > 0 
                ? `${Math.min(100, Math.round((stats.totalCollected / (stats.supportedFamilies * (config?.zakatAmount || 10))) * 100))}%`
                : '0%'}
            </div>
            <p className="text-sm text-gray-500 mt-1">{t('towardsTarget')}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}