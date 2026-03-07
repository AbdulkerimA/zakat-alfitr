'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { LayoutGrid, TableIcon, Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface Mesakin {
  id: string;
  name: string;
  phone: string;
  familyMembers: number;
  idNumber: string;
  status: string;
  registeredAt: any;
}

export default function MesakinPage() {
  const { masjidId } = useAuth();
  const [mesakin, setMesakin] = useState<Mesakin[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    const fetchMesakin = async () => {
      if (!masjidId) return;

      try {
        const q = query(
          collection(db, 'mesakin'),
          where('masjidId', '==', masjidId)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Mesakin[];
        
        setMesakin(data);
      } catch (error) {
        console.error('Error fetching mesakin:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMesakin();
  }, [masjidId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const filteredMesakin = mesakin.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         m.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statuses = ['all', ...Array.from(new Set(mesakin.map(m => m.status)))];

  const totalPages = Math.ceil(filteredMesakin.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMesakin = filteredMesakin.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      received: 'bg-blue-100 text-blue-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold">Mesakin List</h1>
        <div className="hidden md:flex gap-2">
          <Button
            variant={viewMode === 'card' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('card')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('table')}
          >
            <TableIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-md bg-white text-sm"
        >
          {statuses.map(status => (
            <option key={status} value={status}>
              {status === 'all' ? 'All Status' : status}
            </option>
          ))}
        </select>
      </div>

      {filteredMesakin.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-gray-500">No mesakin registered yet</p>
          </CardContent>
        </Card>
      ) : viewMode === 'table' ? (
        <Card className="hidden md:block">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Family</TableHead>
                  <TableHead>Income Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Registered</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedMesakin.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell>{m.phone}</TableCell>
                    <TableCell>{m.familyMembers}</TableCell>
                    <TableCell className="capitalize">{m.idNumber}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(m.status)}>{m.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {m.registeredAt?.toDate ? format(m.registeredAt.toDate(), 'MMM dd, yyyy') : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {paginatedMesakin.map((m) => (
            <Card key={m.id}>
              <CardHeader>
                <CardTitle className="text-lg">{m.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Phone:</span>
                  <span className="font-medium">{m.phone}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Family Members:</span>
                  <span className="font-medium">{m.familyMembers}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">ID Number:</span>
                  <span className="font-medium capitalize">{m.idNumber}</span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-gray-500">Status:</span>
                  <Badge className={getStatusBadge(m.status)}>{m.status}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Registered:</span>
                  <span className="font-medium">
                    {m.registeredAt?.toDate ? format(m.registeredAt.toDate(), 'MMM dd, yyyy') : 'N/A'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredMesakin.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredMesakin.length)} of {filteredMesakin.length}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-3 py-2 text-sm">{currentPage} / {totalPages}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}