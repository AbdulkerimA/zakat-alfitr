'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { useMasjid } from '@/contexts/MasjidContext';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  zakatAmount: z.string().min(1, 'Amount is required'),
  packageItems: z.string().min(3, 'Package items are required'),
  packageCost: z.string().min(1, 'Package cost is required'),
  maxPerDistributor: z.string().min(1, 'Maximum is required'),
});

export default function ConfigPage() {
  const router = useRouter();
  const { user, masjidId } = useAuth();
  const { config, refresh } = useMasjid();
  const [loading, setLoading] = useState(false);
  const [configId, setConfigId] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      zakatAmount: '10',
      packageItems: 'Rice (5kg), Flour (3kg), Dates (1kg), Milk (2L)',
      packageCost: '10',
      maxPerDistributor: '20',
    },
  });

  useEffect(() => {
    if (config) {
      form.reset({
        zakatAmount: config.zakatAmount.toString(),
        packageItems: config.packageItems.join(', '),
        packageCost: config.packageCost.toString(),
        maxPerDistributor: config.maxPerDistributor.toString(),
      });
      setConfigId(config.id);
    }
  }, [config, form]);

  const onSubmit = async (values: any) => {
    if (!masjidId || !user) {
      toast.error('You must be logged in');
      return;
    }

    setLoading(true);
    try {
      const configData = {
        masjidId,
        zakatAmount: parseInt(values.zakatAmount),
        packageItems: values.packageItems.split(',').map((item: string) => item.trim()),
        packageCost: parseInt(values.packageCost),
        maxPerDistributor: parseInt(values.maxPerDistributor),
        updatedAt: new Date(),
      };

      if (configId) {
        // Update existing
        await updateDoc(doc(db, 'configs', configId), configData);
        toast.success('Configuration updated');
      } else {
        // Create new
        await addDoc(collection(db, 'configs'), configData);
        toast.success('Configuration saved');
      }

      await refresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save configuration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Masjid Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="zakatAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zakat Amount per Person (ETB)</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormDescription>
                      The amount each person should pay for Zakat al-Fitr
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="packageItems"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Distribution Package Items</FormLabel>
                    <FormControl>
                      <Input placeholder="Item1, Item2, Item3" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter items separated by commas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="packageCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Package Cost (ETB)</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormDescription>
                      Estimated cost of one distribution package
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* <FormField
                control={form.control}
                name="maxPerDistributor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Families per Distributor</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormDescription>
                      Maximum number of families one distributor can handle
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}

              <Button type="submit" className="w-full" disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                {loading ? 'Saving...' : 'Save Configuration'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}