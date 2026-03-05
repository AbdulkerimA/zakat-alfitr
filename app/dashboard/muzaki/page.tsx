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

interface Muzaki {
  id: string;
  name: string;
  phone: string;
  email: string;
  peopleCount: number;
  amount: number;
  paymentStatus: string;
  registeredAt: any;
}

export default function MuzakiPage() {
  const { masjidId } = useAuth();
  const [muzaki, setMuzaki] = useState<Muzaki[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCollected, setTotalCollected] = useState(0);

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
        setTotalCollected(data.reduce((sum, m) => sum + m.amount, 0));
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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Muzaki List</h1>

      <Card className="bg-green-50">
        <CardContent className="pt-6">
          <div className="text-2xl font-bold text-green-700">
            Total Collected: ${totalCollected}
          </div>
          <p className="text-sm text-gray-600">From {muzaki.length} donors</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Registered Donors</CardTitle>
        </CardHeader>
        <CardContent>
          {muzaki.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No muzaki registered yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>People</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {muzaki.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell>{m.phone}</TableCell>
                    <TableCell>{m.email}</TableCell>
                    <TableCell>{m.peopleCount}</TableCell>
                    <TableCell>${m.amount}</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">
                        {m.paymentStatus}
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