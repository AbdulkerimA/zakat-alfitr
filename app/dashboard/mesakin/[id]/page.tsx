'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { db } from '@/lib/firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

interface MesakinDetails {
  id: string;
  name: string;
  phone: string;
  address: string;
  idNumber: string;
  familyMembers: number;
  notes?: string;
  status: string;
  registeredAt: any;
}

export default function MesakinDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const fromPage = searchParams.get('from')?.replace('page-', '') || '1';
  const t = useTranslations('mesakin');
  const [mesakin, setMesakin] = useState<MesakinDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchMesakin = async () => {
      try {
        const docRef = doc(db, 'mesakin', params.id as string);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setMesakin({ id: docSnap.id, ...docSnap.data() } as MesakinDetails);
        }
      } catch (error) {
        console.error('Error fetching mesakin:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMesakin();
  }, [params.id]);

  const updateStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      await updateDoc(doc(db, 'mesakin', params.id as string), {
        status: newStatus,
        updatedAt: new Date(),
      });
      setMesakin(prev => prev ? { ...prev, status: newStatus } : null);
      toast.success(`${t('statusUpdated')} ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!mesakin) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{t('notFound')}</p>
        <Button onClick={() => router.push('/dashboard/mesakin')} className="mt-4">
          {t('backToList')}
        </Button>
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
    <div className="max-w-3xl mx-auto space-y-4">
      <Button
        variant="ghost"
        onClick={() => router.push(`/dashboard/mesakin?page=${fromPage}`)}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        {t('backToList')}
      </Button>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-2xl">{mesakin.name}</CardTitle>
            <Badge className={getStatusBadge(mesakin.status)}>{mesakin.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">{t('phone')}</p>
              <p className="font-medium">{mesakin.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('idNumber')}</p>
              <p className="font-medium">{mesakin.idNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('familyMembers')}</p>
              <p className="font-medium">{mesakin.familyMembers}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('registeredDate')}</p>
              <p className="font-medium">
                {mesakin.registeredAt?.toDate ? format(mesakin.registeredAt.toDate(), 'MMM dd, yyyy') : 'N/A'}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500">{t('address')}</p>
            <p className="font-medium">{mesakin.address}</p>
          </div>

          {mesakin.notes && (
            <div>
              <p className="text-sm text-gray-500">{t('notes')}</p>
              <p className="font-medium">{mesakin.notes}</p>
            </div>
          )}

          <div className="pt-4 border-t">
            <p className="text-sm text-gray-500 mb-3">{t('updateStatus')}</p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={mesakin.status === 'pending' ? 'default' : 'outline'}
                onClick={() => updateStatus('pending')}
                disabled={updating || mesakin.status === 'pending'}
              >
                {t('pending')}
              </Button>
              <Button
                size="sm"
                variant={mesakin.status === 'approved' ? 'default' : 'outline'}
                onClick={() => updateStatus('approved')}
                disabled={updating || mesakin.status === 'approved'}
                className={mesakin.status === 'approved' ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                {t('approved')}
              </Button>
              <Button
                size="sm"
                variant={mesakin.status === 'received' ? 'default' : 'outline'}
                onClick={() => updateStatus('received')}
                disabled={updating || mesakin.status === 'received'}
                className={mesakin.status === 'received' ? 'bg-blue-600 hover:bg-blue-700' : ''}
              >
                {t('received')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
