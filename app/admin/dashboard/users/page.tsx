'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, query, orderBy, where, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Users, Search, Building, UserCheck, Ban, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Distributor {
  id: string;
  name: string;
  email: string;
  phone: string;
  masjidId: string;
  masjidName: string;
  role: string;
  disabled: boolean;
  createdAt: any;
  stats?: {
    mesakinDistributed: number;
  };
}

interface Stats {
  totalDistributors: number;
  totalMasjids: number;
  activeDistributors: number;
}

export default function UsersPage() {
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [filteredDistributors, setFilteredDistributors] = useState<Distributor[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalDistributors: 0,
    totalMasjids: 0,
    activeDistributors: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDistributor, setSelectedDistributor] = useState<Distributor | null>(null);

  useEffect(() => {
    fetchDistributors();
  }, []);

  useEffect(() => {
    filterDistributors();
  }, [searchTerm, distributors]);

  const fetchDistributors = async () => {
    try {
      // Fetch all distributors
      const distributorsQuery = query(
        collection(db, 'distributors'),
        orderBy('createdAt', 'desc')
      );
      const distributorsSnapshot = await getDocs(distributorsQuery);
      
      // Fetch all masjids to get names
      const masjidsSnapshot = await getDocs(collection(db, 'masjids'));
      const masjidsMap = new Map();
      masjidsSnapshot.docs.forEach(doc => {
        masjidsMap.set(doc.id, doc.data().name);
      });

      // Get unique masjid count
      const uniqueMasjids = new Set(distributorsSnapshot.docs.map(doc => doc.data().masjidId));
      
      // Process distributors
      const distributorsData = await Promise.all(
        distributorsSnapshot.docs.map(async (doc) => {
          const data = doc.data();
          
          // Get distribution count for this distributor
          const mesakinQuery = query(
            collection(db, 'mesakin'),
            where('distributorId', '==', doc.id),
            where('status', '==', 'received')
          );
          const mesakinSnap = await getDocs(mesakinQuery);
          
          return {
            id: doc.id,
            name: data.name || 'N/A',
            email: data.email || 'N/A',
            phone: data.phone || 'N/A',
            masjidId: data.masjidId || '',
            masjidName: masjidsMap.get(data.masjidId) || 'Unknown',
            role: data.role || 'distributor',
            disabled: data.disabled || false,
            createdAt: data.createdAt,
            stats: {
              mesakinDistributed: mesakinSnap.size,
            },
          };
        })
      );

      setStats({
        totalDistributors: distributorsData.length,
        totalMasjids: uniqueMasjids.size,
        activeDistributors: distributorsData.filter(d => d.stats && d.stats.mesakinDistributed > 0).length,
      });

      setDistributors(distributorsData);
      setFilteredDistributors(distributorsData);
    } catch (error) {
      console.error('Error fetching distributors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterDistributors = () => {
    let filtered = [...distributors];

    if (searchTerm) {
      filtered = filtered.filter(d => 
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.masjidName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredDistributors(filtered);
  };

  const handleToggleDisable = async (distributor: Distributor) => {
    try {
      await updateDoc(doc(db, 'distributors', distributor.id), {
        disabled: !distributor.disabled,
      });
      
      toast.success(`Distributor ${!distributor.disabled ? 'disabled' : 'enabled'} successfully`);
      fetchDistributors();
    } catch (error) {
      console.error('Error toggling distributor status:', error);
      toast.error('Failed to update distributor status');
    }
  };

  const handleDeleteClick = (distributor: Distributor) => {
    setSelectedDistributor(distributor);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDistributor) return;

    try {
      await deleteDoc(doc(db, 'distributors', selectedDistributor.id));
      
      toast.success('Distributor deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedDistributor(null);
      fetchDistributors();
    } catch (error) {
      console.error('Error deleting distributor:', error);
      toast.error('Failed to delete distributor');
    }
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
      <h1 className="text-2xl md:text-3xl font-bold">Users (Distributors)</h1>

      <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs md:text-sm font-medium text-gray-500">Total Distributors</CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{stats.totalDistributors}</div>
            <p className="text-xs text-gray-500 mt-1">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs md:text-sm font-medium text-gray-500">Active Distributors</CardTitle>
            <UserCheck className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{stats.activeDistributors}</div>
            <p className="text-xs text-gray-500 mt-1">With distributions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs md:text-sm font-medium text-gray-500">Masjids Covered</CardTitle>
            <Building className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{stats.totalMasjids}</div>
            <p className="text-xs text-gray-500 mt-1">Unique masjids</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Distributors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, email, phone, or masjid..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Distributors ({filteredDistributors.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Masjid</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Distributed</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDistributors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      No distributors found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDistributors.map((distributor) => (
                    <TableRow key={distributor.id}>
                      <TableCell className="font-medium">{distributor.name}</TableCell>
                      <TableCell>{distributor.email}</TableCell>
                      <TableCell>{distributor.phone}</TableCell>
                      <TableCell>{distributor.masjidName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {distributor.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{distributor.stats?.mesakinDistributed || 0}</TableCell>
                      <TableCell>
                        <Badge variant={distributor.disabled ? "destructive" : "default"}>
                          {distributor.disabled ? 'Disabled' : 'Active'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {distributor.createdAt?.toDate ? 
                          format(distributor.createdAt.toDate(), 'MMM dd, yyyy') : 
                          'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleDisable(distributor)}
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(distributor)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the distributor
              <span className="font-semibold"> {selectedDistributor?.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
