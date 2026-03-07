'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

const formSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'Phone number is required'),
  address: z.string().min(5, 'Address is required'),
  idNumber: z.string().min(1, 'ID number is required'),
  familyMembers: z.string().min(1, 'Number of family members is required'),
  notes: z.string().optional(),
});

export default function MesakinRegisterPage() {
  const router = useRouter();
  const { user, masjidId } = useAuth();
  const t = useTranslations('mesakin');
  const tForm = useTranslations('form');
  const tCommon = useTranslations('common');
  const [loading, setLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      phone: '',
      address: '',
      idNumber: '',
      familyMembers: '1',
      notes: '',
    },
  });

  const onSubmit = async (values: any) => {
    if (!masjidId || !user) {
      toast.error('You must be logged in');
      return;
    }

    setLoading(true);
    try {
      // Check if phone already exists
      const phoneQuery = query(
        collection(db, 'mesakin'),
        where('phone', '==', values.phone)
      );
      const phoneSnapshot = await getDocs(phoneQuery);
      
      if (!phoneSnapshot.empty) {
        toast.error(t('phoneExists'));
        setLoading(false);
        return;
      }

      // Check if ID number already exists
      const idQuery = query(
        collection(db, 'mesakin'),
        where('idNumber', '==', values.idNumber)
      );
      const idSnapshot = await getDocs(idQuery);
      
      if (!idSnapshot.empty) {
        toast.error(t('idExists'));
        setLoading(false);
        return;
      }

      await addDoc(collection(db, 'mesakin'), {
        ...values,
        familyMembers: parseInt(values.familyMembers),
        masjidId,
        status: 'pending',
        registeredBy: user.uid,
        registeredAt: new Date(),
      });

      toast.success(t('registerSuccess'));
      router.push('/dashboard/mesakin');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> {t('backToDashboard')}
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('register')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('name')}</FormLabel>
                    <FormControl>
                      <Input placeholder={tForm('enterFullName')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('phone')}</FormLabel>
                      <FormControl>
                        <Input placeholder={tForm('phoneNumber')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="familyMembers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('familyMembers')}</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="idNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('idNumber')}</FormLabel>
                    <FormControl>
                      <Input placeholder={tForm('idNumberPlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('address')}</FormLabel>
                    <FormControl>
                      <Input placeholder={tForm('fullAddress')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('notes')}</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder={tForm('additionalInfo')}
                        className="min-h-25"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? tForm('registering') : t('register')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}