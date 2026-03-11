'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Building, Search, Wallet, Users, HandCoins, CheckCircle2, UserCheck, UserPlus } from 'lucide-react';
import { format } from 'date-fns';

interface Masjid {
  id: string;
  name: string;
  city: string;
  state: string;
  adminName: string;
  adminEmail: string;
  phone: string;
  createdAt: any;
  stats?: {
    mesakin: number;
    muzaki: number;
    collections: number;
  };
}

interface GlobalStats {
  totalMasjids: number;
  totalCollected: number;
  totalDistributors: number;
  totalMuzaki: number;
  totalMesakin: number;
  mesakinReceived: number;
  mesakinApproved: number;
}

export default function MasjidsPage() {
  const [masjids, setMasjids] = useState<Masjid[]>([]);
  const [filteredMasjids, setFilteredMasjids] = useState<Masjid[]>([]);
  const [globalStats, setGlobalStats] = useState<GlobalStats>({
    totalMasjids: 0,
    totalCollected: 0,
    totalDistributors: 0,
    totalMuzaki: 0,
    totalMesakin: 0,
    mesakinReceived: 0,
    mesakinApproved: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterMasjids();
  }, [searchTerm, masjids]);

  const fetchData = async () => {
    try {
      // Fetch all masjids
      const masjidsQuery = query(
        collection(db, 'masjids'),
        orderBy('createdAt', 'desc')
      );
      const masjidsSnapshot = await getDocs(masjidsQuery);
      
      // Fetch all mesakin
      const mesakinSnapshot = await getDocs(collection(db, 'mesakin'));
      const allMesakin = mesakinSnapshot.docs.map(doc => doc.data());
      
      // Fetch all muzaki
      const muzakiSnapshot = await getDocs(collection(db, 'muzaki'));
      const allMuzaki = muzakiSnapshot.docs.map(doc => doc.data());
      
      // Fetch all users (distributors)
      const usersSnapshot = await getDocs(collection(db, 'users'));
      
      // Calculate global stats
      const totalCollected = allMuzaki.reduce(
        (sum, m) => sum + ((m.amount || 0) + (m.extra || 0)),
        0
      );
      
      const mesakinReceived = allMesakin.filter(m => m.status === 'received').length;
      const mesakinApproved = allMesakin.filter(m => m.status === 'approved').length;
      
      setGlobalStats({
        totalMasjids: masjidsSnapshot.size,
        totalCollected,
        totalDistributors: usersSnapshot.size,
        totalMuzaki: allMuzaki.length,
        totalMesakin: allMesakin.length,
        mesakinReceived,
        mesakinApproved,
      });
      
      // Process masjids with their stats
      const masjidsData = await Promise.all(
        masjidsSnapshot.docs.map(async (doc) => {
          const data = doc.data();
          
          const mesakinQuery = query(
            collection(db, 'mesakin'),
            where('masjidId', '==', doc.id)
          );
          const muzakiQuery = query(
            collection(db, 'muzaki'),
            where('masjidId', '==', doc.id)
          );

          const [mesakinSnap, muzakiSnap] = await Promise.all([
            getDocs(mesakinQuery),
            getDocs(muzakiQuery)
          ]);

          const totalCollections = muzakiSnap.docs.reduce(
            (sum, doc) => sum + ((doc.data().amount || 0) + (doc.data().extra || 0)),
            0
          );
          
          return {
            id: doc.id,
            name: data.name || 'Unknown',
            city: data.city || 'N/A',
            state: data.state || 'N/A',
            adminName: data.adminName || 'N/A',
            adminEmail: data.adminEmail || 'N/A',
            phone: data.phone || 'N/A',
            createdAt: data.createdAt,
            stats: {
              mesakin: mesakinSnap.size,
              muzaki: muzakiSnap.size,
              collections: totalCollections,
            },
          };
        })
      );

      setMasjids(masjidsData);
      setFilteredMasjids(masjidsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterMasjids = () => {
    let filtered = [...masjids];

    if (searchTerm) {
      filtered = filtered.filter(m => 
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.adminName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredMasjids(filtered);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold">Masjids</h1>

      <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs md:text-sm font-medium text-gray-500">Total Masjids</CardTitle>
            <Building className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{globalStats.totalMasjids}</div>
            <p className="text-xs text-gray-500 mt-1">Registered masjids</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs md:text-sm font-medium text-gray-500">Total Collected</CardTitle>
            <Wallet className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{globalStats.totalCollected} ETB</div>
            <p className="text-xs text-gray-500 mt-1">From all donations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs md:text-sm font-medium text-gray-500">Total Distributors</CardTitle>
            <UserPlus className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{globalStats.totalDistributors}</div>
            <p className="text-xs text-gray-500 mt-1">Active users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs md:text-sm font-medium text-gray-500">Total Muzaki</CardTitle>
            <HandCoins className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{globalStats.totalMuzaki}</div>
            <p className="text-xs text-gray-500 mt-1">Registered donors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs md:text-sm font-medium text-gray-500">Total Mesakin</CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{globalStats.totalMesakin}</div>
            <p className="text-xs text-gray-500 mt-1">Registered families</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs md:text-sm font-medium text-gray-500">Mesakin Received</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{globalStats.mesakinReceived}</div>
            <p className="text-xs text-gray-500 mt-1">Received status</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs md:text-sm font-medium text-gray-500">Mesakin Approved</CardTitle>
            <UserCheck className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{globalStats.mesakinApproved}</div>
            <p className="text-xs text-gray-500 mt-1">Approved status</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Masjids</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, city, state, or admin..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Masjids ({filteredMasjids.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Masjid</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Mesakin</TableHead>
                  <TableHead>Muzaki</TableHead>
                  <TableHead>Collections</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMasjids.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No masjids found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMasjids.map((masjid) => (
                    <TableRow key={masjid.id}>
                      <TableCell className="font-medium">{masjid.name}</TableCell>
                      <TableCell>{masjid.city}, {masjid.state}</TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">{masjid.adminName}</div>
                          <div className="text-xs text-gray-500">{masjid.adminEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>{masjid.stats?.mesakin || 0}</TableCell>
                      <TableCell>{masjid.stats?.muzaki || 0}</TableCell>
                      <TableCell>{masjid.stats?.collections.toLocaleString()} ETB</TableCell>
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
