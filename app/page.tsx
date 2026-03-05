import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Building, Users, HandHeart, Shield } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-green-50 to-white">
      {/* Hero */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Building className="h-16 w-16 text-green-600 mx-auto mb-6" />
        <h1 className="text-5xl font-bold text-green-800 mb-4">
          Zakat al-Fitr Management
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          A transparent, mosque-based system for collecting and distributing Zakat al-Fitr
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/register">
            <Button size="lg" className="bg-green-600 hover:bg-green-700">
              Register Your Masjid
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">
              Login to Dashboard
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            icon={<Building className="h-8 w-8 text-green-600" />}
            title="Masjid-Based"
            description="Each masjid has its own independent workspace"
          />
          <FeatureCard
            icon={<Users className="h-8 w-8 text-green-600" />}
            title="Recipient Management"
            description="Register and manage families in need"
          />
          <FeatureCard
            icon={<HandHeart className="h-8 w-8 text-green-600" />}
            title="Donor Registration"
            description="Easy tracking of donations and donors"
          />
          <FeatureCard
            icon={<Shield className="h-8 w-8 text-green-600" />}
            title="Complete Transparency"
            description="Real-time statistics and full audit trail"
          />
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}