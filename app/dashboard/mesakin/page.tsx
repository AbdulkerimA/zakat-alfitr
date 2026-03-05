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
import { format } from 'date-fns';

interface Mesakin {
  id: string;
  name: string;
  phone: string;
  familyMembers: number;
  incomeLevel: string;
  status: string;
  registeredAt: any;
}

export default function MesakinPage() {
  const { masjidId } = useAuth();
  const [mesakin, setMesakin] = useState<Mesakin[]>([]);
  const [loading, setLoading] = useState(true);

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

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      received: 'bg-blue-100 text-blue-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Mesakin List</h1>

      <Card>
        <CardHeader>
          <CardTitle>Registered Recipients</CardTitle>
        </CardHeader>
        <CardContent>
          {mesakin.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No mesakin registered yet</p>
          ) : (
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
                {mesakin.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell>{m.phone}</TableCell>
                    <TableCell>{m.familyMembers}</TableCell>
                    <TableCell className="capitalize">{m.incomeLevel.replace('_', ' ')}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(m.status)}>
                        {m.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {m.registeredAt?.toDate ? 
                        format(m.registeredAt.toDate(), 'MMM dd, yyyy') : 
                        'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}