'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSuperAdmin } from '@/contexts/SuperAdminContext';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Shield, 
  LogOut, 
  Users, 
  Building, 
  DollarSign, 
  Package,
  Activity,
  Calendar,
  TrendingUp,
  UserPlus,
  HandCoins,
  Settings,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface MasjidData {
  id: string;
  name: string;
  city: string;
  state: string;
  adminName: string;
  adminEmail: string;
  createdAt: any;
  stats: {
    mesakin: number;
    muzaki: number;
    collections: number;
    distributions: number;
  };
}

export default function SuperAdminDashboard() {
  const router = useRouter();
  const { admin, logout, stats, refreshStats } = useSuperAdmin();
  const [masjids, setMasjids] = useState<MasjidData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  useEffect(() => {
    fetchMasjids();
  }, []);

  const fetchMasjids = async () => {
    try {
      const masjidsSnapshot = await getDocs(collection(db, 'masjids'));
      
      const masjidsData = await Promise.all(
        masjidsSnapshot.docs.map(async (doc) => {
          const data = doc.data();
          
          // Get counts for this masjid
          const mesakinQuery = query(
            collection(db, 'mesakin'), 
            where('masjidId', '==', doc.id)
          );
          const muzakiQuery = query(
            collection(db, 'muzaki'), 
            where('masjidId', '==', doc.id)
          );
          const collectionsQuery = query(
            collection(db, 'collections'), 
            where('masjidId', '==', doc.id)
          );
          const distributionsQuery = query(
            collection(db, 'distributions'), 
            where('masjidId', '==', doc.id)
          );

          const [mesakinSnap, muzakiSnap, collectionsSnap, distributionsSnap] = await Promise.all([
            getDocs(mesakinQuery),
            getDocs(muzakiQuery),
            getDocs(collectionsQuery),
            getDocs(distributionsQuery)
          ]);

          const totalCollections = collectionsSnap.docs.reduce(
            (sum, doc) => sum + (doc.data().amount || 0), 
            0
          );

          const totalDistributions = distributionsSnap.docs.reduce(
            (sum, doc) => sum + (doc.data().amount || 0), 
            0
          );

          return {
            id: doc.id,
            name: data.name || 'Unknown',
            city: data.city || 'N/A',
            state: data.state || 'N/A',
            adminName: data.adminName || 'N/A',
            adminEmail: data.adminEmail || 'N/A',
            createdAt: data.createdAt,
            stats: {
              mesakin: mesakinSnap.size,
              muzaki: muzakiSnap.size,
              collections: totalCollections,
              distributions: totalDistributions,
            },
          };
        })
      );

      setMasjids(masjidsData);
    } catch (error) {
      console.error('Error fetching masjids:', error);
      toast.error('Failed to load masjids data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
    toast.success('Logged out successfully');
  };

  const totalCollections = masjids.reduce((sum, m) => sum + m.stats.collections, 0);
  const totalDistributions = masjids.reduce((sum, m) => sum + m.stats.distributions, 0);
  const totalMesakin = masjids.reduce((sum, m) => sum + m.stats.mesakin, 0);
  const totalMuzaki = masjids.reduce((sum, m) => sum + m.stats.muzaki, 0);

  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold">Super Admin Dashboard</h1>
      
      <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs md:text-sm font-medium text-gray-500">Total Masjids</CardTitle>
            <Building className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{masjids.length}</div>
            <p className="text-xs text-gray-500 mt-1">Registered masjids</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs md:text-sm font-medium text-gray-500">Total Mesakin</CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{totalMesakin}</div>
            <p className="text-xs text-gray-500 mt-1">Registered families</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs md:text-sm font-medium text-gray-500">Total Muzaki</CardTitle>
            <HandCoins className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{totalMuzaki}</div>
            <p className="text-xs text-gray-500 mt-1">Registered donors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs md:text-sm font-medium text-gray-500">System Users</CardTitle>
            <UserPlus className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{stats?.totalDistributors || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Active distributors</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Total Collections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${totalCollections.toLocaleString()}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              From {totalMuzaki} donors across {masjids.length} masjids
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Distributions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${totalDistributions.toLocaleString()}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Distributed to {totalMesakin} families
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registered Masjids</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Masjid</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>Mesakin</TableHead>
                    <TableHead>Muzaki</TableHead>
                    <TableHead>Collected</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {masjids.map((masjid) => (
                    <TableRow key={masjid.id}>
                      <TableCell className="font-medium">{masjid.name}</TableCell>
                      <TableCell>{masjid.city}, {masjid.state}</TableCell>
                      <TableCell>
                        <div>
                          <div>{masjid.adminName}</div>
                          <div className="text-xs text-gray-500">{masjid.adminEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>{masjid.stats.mesakin}</TableCell>
                      <TableCell>{masjid.stats.muzaki}</TableCell>
                      <TableCell>${masjid.stats.collections.toLocaleString()}</TableCell>
                      <TableCell>
                        {masjid.createdAt?.toDate ? 
                          format(masjid.createdAt.toDate(), 'MMM dd, yyyy') : 
                          'N/A'}
                      </TableCell>
                      <TableCell>
                        <Link href={`/admin/dashboard/masjids/${masjid.id}`}>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}