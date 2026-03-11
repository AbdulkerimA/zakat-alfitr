'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/firebase/config';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, HandCoins, Wallet, CheckCircle2, Clock, UserCheck } from 'lucide-react';

interface MasjidDetails {
  id: string;
  name: string;
  city: string;
  state: string;
  adminName: string;
  adminEmail: string;
  phone: string;
  address: string;
  createdAt: any;
}

interface Stats {
  totalMesakin: number;
  totalMuzaki: number;
  totalCollected: number;
  mesakinReceived: number;
  mesakinPending: number;
  mesakinApproved: number;
}

export default function MasjidDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const masjidId = params.id as string;
  const [masjid, setMasjid] = useState<MasjidDetails | null>(null);
  const [stats, setStats] = useState<Stats>({
    totalMesakin: 0,
    totalMuzaki: 0,
    totalCollected: 0,
    mesakinReceived: 0,
    mesakinPending: 0,
    mesakinApproved: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (masjidId) {
      fetchMasjidDetails();
    }
  }, [masjidId]);

  const fetchMasjidDetails = async () => {
    try {
      // Fetch masjid details
      const masjidDoc = await getDoc(doc(db, 'masjids', masjidId));
      
      if (!masjidDoc.exists()) {
        router.push('/admin/dashboard/masjids');
        return;
      }

      const masjidData = masjidDoc.data();
      setMasjid({
        id: masjidDoc.id,
        name: masjidData.name || 'Unknown',
        city: masjidData.city || 'N/A',
        state: masjidData.state || 'N/A',
        adminName: masjidData.adminName || 'N/A',
        adminEmail: masjidData.adminEmail || 'N/A',
        phone: masjidData.phone || 'N/A',
        address: masjidData.address || 'N/A',
        createdAt: masjidData.createdAt,
      });

      // Fetch mesakin
      const mesakinQuery = query(
        collection(db, 'mesakin'),
        where('masjidId', '==', masjidId)
      );
      const mesakinSnap = await getDocs(mesakinQuery);
      const mesakinData = mesakinSnap.docs.map(doc => doc.data());

      // Count by status
      const received = mesakinData.filter(m => m.status === 'received').length;
      const pending = mesakinData.filter(m => m.status === 'pending').length;
      const approved = mesakinData.filter(m => m.status === 'approved').length;

      // Fetch muzaki
      const muzakiQuery = query(
        collection(db, 'muzaki'),
        where('masjidId', '==', masjidId)
      );
      const muzakiSnap = await getDocs(muzakiQuery);
      const muzakiData = muzakiSnap.docs.map(doc => doc.data());

      // Calculate total collected
      const totalCollected = muzakiData.reduce(
        (sum, m) => sum + ((m.amount || 0) + (m.extra || 0)),
        0
      );

      setStats({
        totalMesakin: mesakinData.length,
        totalMuzaki: muzakiData.length,
        totalCollected,
        mesakinReceived: received,
        mesakinPending: pending,
        mesakinApproved: approved,
      });
    } catch (error) {
      console.error('Error fetching masjid details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!masjid) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Masjid not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/dashboard/masjids">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold">{masjid.name}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Masjid Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-medium">{masjid.city}, {masjid.state}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Address</p>
              <p className="font-medium">{masjid.address}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Admin Name</p>
              <p className="font-medium">{masjid.adminName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Admin Email</p>
              <p className="font-medium">{masjid.adminEmail}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium">{masjid.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Registered</p>
              <p className="font-medium">
                {masjid.createdAt?.toDate ? 
                  masjid.createdAt.toDate().toLocaleDateString() : 
                  'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs md:text-sm font-medium text-gray-500">Total Mesakin</CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{stats.totalMesakin}</div>
            <p className="text-xs text-gray-500 mt-1">Registered families</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs md:text-sm font-medium text-gray-500">Total Muzaki</CardTitle>
            <HandCoins className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{stats.totalMuzaki}</div>
            <p className="text-xs text-gray-500 mt-1">Registered donors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs md:text-sm font-medium text-gray-500">Total Collected</CardTitle>
            <Wallet className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{stats.totalCollected} ETB</div>
            <p className="text-xs text-gray-500 mt-1">From donations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs md:text-sm font-medium text-gray-500">Received</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{stats.mesakinReceived}</div>
            <p className="text-xs text-gray-500 mt-1">Mesakin received</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs md:text-sm font-medium text-gray-500">Pending</CardTitle>
            <Clock className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{stats.mesakinPending}</div>
            <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs md:text-sm font-medium text-gray-500">Approved</CardTitle>
            <UserCheck className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{stats.mesakinApproved}</div>
            <p className="text-xs text-gray-500 mt-1">Ready for distribution</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
