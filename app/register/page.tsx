'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { auth, db } from '@/lib/firebase/config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Building, Mail, Phone, User, Lock, MapPin } from 'lucide-react';

const formSchema = z.object({
  masjidName: z.string().min(2, 'Masjid name is required'),
  city: z.string().min(2, 'City is required'),
  adminPhone: z.string().min(10, 'Valid phone number is required'),
  adminName: z.string().min(2, 'Admin name is required'),
  adminEmail: z.string().email('Invalid admin email'),
  adminPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      masjidName: '',
      adminPhone: '',
      adminName: '',
      adminEmail: '',
      adminPassword: '',
    },
  });

  const onSubmit = async (values: any) => {
    setLoading(true);
    try {
      // Create auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.adminEmail,
        values.adminPassword
      );

      // Create masjid document
      const masjidRef = await addDoc(collection(db, 'masjids'), {
        name: values.masjidName,
        city: values.city,
        adminName: values.adminName,
        adminEmail: values.adminEmail,
        createdAt: new Date(),
      });

      // Create distributor record
      await setDoc(doc(db, 'distributors', userCredential.user.uid), {
        masjidId: masjidRef.id,
        uid: userCredential.user.uid,
        name: values.adminName,
        email: values.adminEmail,
        phone: values.adminPhone,
        role: 'admin',
        active: true,
        createdAt: new Date(),
      });

      // Create default config
      await addDoc(collection(db, 'configs'), {
        masjidId: masjidRef.id,
        zakatAmount: 120,
        packageItems: ['Flour (5kg)'],
        packageCost: 600,
        maxPerDistributor: 2000,
        updatedAt: new Date(),
      });

      toast.success('Masjid registered successfully!');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-green-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Building className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-green-800">Register Your Masjid</h1>
          <p className="text-gray-600 mt-2">Start managing Zakat al-Fitr efficiently</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Masjid Registration</CardTitle>
            <CardDescription>
              Fill in the details to create your masjid account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Masjid Information</h3>
                  
                  <FormField
                    control={form.control}
                    name="masjidName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Masjid Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input className="pl-10" placeholder="Enter masjid name" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="City" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Administrator Information</h3>
                  
                  <FormField
                    control={form.control}
                    name="adminName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input className="pl-10" placeholder="Admin name" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                      control={form.control}
                      name="adminPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input className="pl-10" placeholder="Phone number" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                  <FormField
                    control={form.control}
                    name="adminEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input className="pl-10" type="email" placeholder="Login email" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="adminPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input className="pl-10" type="password" placeholder="Create password" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Registering...' : 'Register Masjid'}
                </Button>

                <p className="text-center text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link href="/login" className="text-green-600 hover:underline">
                    Login here
                  </Link>
                </p>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}