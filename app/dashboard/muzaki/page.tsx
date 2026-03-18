'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
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
import { LayoutGrid, TableIcon, Search, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface Muzaki {
  id: string;
  name: string;
  phone: string;
  email: string;
  peopleCount: number;
  amount: number;
  extra: number;
  paymentStatus: string;
  registeredAt: any;
}

export default function MuzakiPage() {
  const { masjidId } = useAuth();
  const t = useTranslations('muzaki');
  const tPagination = useTranslations('pagination');
  const [muzaki, setMuzaki] = useState<Muzaki[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCollected, setTotalCollected] = useState(0);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const [sortBy, setSortBy] = useState<'name' | 'date-desc' | 'date-asc'>('date-desc');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this muzaki?')) return;
    setDeletingId(id);
    try {
      await deleteDoc(doc(db, 'muzaki', id));
      setMuzaki(prev => prev.filter(m => m.id !== id));
      setTotalCollected(prev => {
        const deleted = muzaki.find(m => m.id === id);
        return deleted ? prev - deleted.amount - deleted.extra : prev;
      });
    } catch (error) {
      console.error('Error deleting muzaki:', error);
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    const fetchMuzaki = async () => {
      if (!masjidId) return;

      try {
        const q = query(
          collection(db, 'muzaki'),
          where('masjidId', '==', masjidId)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Muzaki[];
        
        setMuzaki(data);
        setTotalCollected(data.reduce((sum, m) => sum + m.amount + m.extra, 0));
      } catch (error) {
        console.error('Error fetching muzaki:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMuzaki();
  }, [masjidId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const filteredMuzaki = muzaki.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || m.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    const dateA = a.registeredAt?.toDate?.() || new Date(0);
    const dateB = b.registeredAt?.toDate?.() || new Date(0);
    if (sortBy === 'date-desc') {
      return dateB.getTime() - dateA.getTime();
    }
    return dateA.getTime() - dateB.getTime();
  });

  const statuses = ['all', ...Array.from(new Set(muzaki.map(m => m.paymentStatus)))];

  const totalPages = Math.ceil(filteredMuzaki.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMuzaki = filteredMuzaki.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold">{t('title')}</h1>
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

      <Card className="bg-green-50">
        <CardContent className="pt-6">
          <div className="text-2xl font-bold text-green-700">
            {t('totalCollected')}: {totalCollected} ETB
          </div>
          <p className="text-sm text-gray-600">{t('fromDonors', { count: muzaki.length })}</p>
        </CardContent>
      </Card>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={t('searchPlaceholder')}
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
              {status === 'all' ? t('allStatus') : status}
            </option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'name' | 'date-desc' | 'date-asc')}
          className="px-3 py-2 border rounded-md bg-white text-sm"
        >
          <option value="date-desc">{t('sortByDateNewest')}</option>
          <option value="date-asc">{t('sortByDateOldest')}</option>
          <option value="name">{t('sortByName')}</option>
        </select>
      </div>

      {filteredMuzaki.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-gray-500">{t('noRecords')}</p>
          </CardContent>
        </Card>
      ) : viewMode === 'table' ? (
        <Card className="hidden md:block">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('name')}</TableHead>
                  <TableHead>{t('phone')}</TableHead>
                  <TableHead>{t('email')}</TableHead>
                  <TableHead>{t('people')}</TableHead>
                  <TableHead>{t('amount')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                  <TableHead>{t('date')}</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedMuzaki.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell>{m.peopleCount}</TableCell>
                    <TableCell>ETB {m.amount + m.extra}</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">{m.paymentStatus}</Badge>
                    </TableCell>
                    <TableCell>
                      {m.registeredAt?.toDate ? format(m.registeredAt.toDate(), 'MMM dd, yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(m.id)} disabled={deletingId === m.id}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {paginatedMuzaki.map((m) => (
            <Card key={m.id}>
              <CardHeader>
                <CardTitle className="text-lg">{m.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{t('peopleCount')}:</span>
                  <span className="font-medium">{m.peopleCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{t('amount')}:</span>
                  <span className="font-bold text-green-600">ETB {m.amount + m.extra}</span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-gray-500">{t('status')}:</span>
                  <Badge className="bg-green-100 text-green-800">{m.paymentStatus}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{t('date')}:</span>
                  <span className="font-medium">
                    {m.registeredAt?.toDate ? format(m.registeredAt.toDate(), 'MMM dd, yyyy') : 'N/A'}
                  </span>
                </div>
                <Button variant="outline" size="sm" className="w-full text-red-500 hover:text-red-700 hover:bg-red-50 mt-2" onClick={() => handleDelete(m.id)} disabled={deletingId === m.id}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredMuzaki.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {tPagination('showing', { start: startIndex + 1, end: Math.min(startIndex + itemsPerPage, filteredMuzaki.length), total: filteredMuzaki.length })}
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