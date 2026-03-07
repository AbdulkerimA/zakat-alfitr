'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { db } from '@/lib/firebase/config';
import { collection, addDoc } from 'firebase/firestore';
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
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
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

const formSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  totalPayed: z.number().min(1, 'Amount must be greater than 0'),
  Change: z.number().min(0, 'Change cannot be negative'),
  extra: z.number().min(0, 'Change cannot be negative'),
  peopleCount: z.string().min(1, 'Number of people is required'),
  paymentMethod: z.enum(['cash', 'bank', 'online']),
});

export default function MuzakiRegisterPage() {
  const router = useRouter();
  const { user, masjidId } = useAuth();
  const { config } = useMasjid();
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [change, setChange] = useState(0);
  const [amount, setAmount] = useState(0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      totalPayed: 0,
      Change: 0,
      extra: 0,
      peopleCount: '1',
      paymentMethod: 'cash',
    },
  });

  const peopleCount = form.watch('peopleCount');

  useEffect(() => {
    const amount = config?.zakatAmount || 10;
    const count = parseInt(peopleCount) || 1;
    setTotal(amount * count);
  }, [peopleCount, config]);

  const onSubmit = async (values: any) => {
    if (!masjidId || !user) {
      toast.error('You must be logged in');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'muzaki'), {
        ...values,
        peopleCount: parseInt(values.peopleCount),
        amount: total,
        masjidId,
        paymentStatus: 'paid',
        registeredBy: user.uid,
        registeredAt: new Date(),
      });

      toast.success('Muzaki registered successfully');
      router.push('/dashboard/muzaki');
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
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Register Muzaki (Donors)</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="peopleCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of People</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="totalPayed"
                    render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payed Amount</FormLabel>
                      <FormControl>
                      <Input
                        placeholder="0"
                        type="number"
                        min="0"
                        {...field}
                        onChange={e => {
                        const value = Number(e.target.value);
                        field.onChange(value);
                        // Calculate change and update form value
                        const calculatedChange = value - total;
                        form.setValue('Change', calculatedChange >= 0 ? calculatedChange : 0);
                        form.setValue('extra', calculatedChange >= 0 ? calculatedChange : 0);
                        }}
                      />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                    )}
                  />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="Change"
                    render={({ field }) => (
                    <FormItem>
                      <FormLabel>Change</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="change" {...field} disabled/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                    control={form.control}
                    name="extra"
                    render={({ field }) => (
                    <FormItem>
                      <FormLabel>extra amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="change"
                          value={field.value}
                          onChange={e => {
                            const value = Number(e.target.value);
                            field.onChange(isNaN(value) ? 0 : value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">

                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="bank">Bank Transfer</SelectItem>
                          <SelectItem value="online">Online</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Amount per person:</span>
                  <span>ETB {config?.zakatAmount || 10}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold mt-2">
                  <span>Total Amount:</span>
                  <span className="text-green-700">ETB {total}</span>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Registering...' : 'Register Muzaki'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}