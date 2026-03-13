'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, Phone, Send, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-green-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Building className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Register Your Masjid</CardTitle>
          <CardDescription>
            Join our platform to manage your masjid's zakat distribution
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-blue-600 hrink-0 mt-0.5" />
              <h3 className="font-semibold text-blue-900">Registration Notice</h3>
            </div>
            <p className="text-sm text-blue-800 mb-3">
              To register your masjid, please send us the following information:
            </p>
            <ul className="text-sm text-blue-800 space-y-1 mb-3 ml-4 list-disc">
              <li>Masjid Name</li>
              <li>Email Address</li>
              <li>Desired Password</li>
            </ul>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-blue-900">
                <Phone className="h-4 w-4" />
                <span className="font-medium">Phone:</span>
                <a href="tel:0904004053" className="hover:underline">0904004053</a>
              </div>
              <div className="flex items-center gap-2 text-blue-900">
                <Send className="h-4 w-4" />
                <span className="font-medium">Telegram:</span>
                <a href="https://t.me/programer_abdu" target="_blank" rel="noopener noreferrer" className="hover:underline">
                  @programer_abdu
                </a>
              </div>
            </div>
            <p className="text-xs text-blue-700 mt-3">
              We will review your request and grant access within 24 hours.
            </p>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">
              Already have an account?
            </p>
            <Link href="/login">
              <Button variant="outline" className="w-full">
                Login to Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
