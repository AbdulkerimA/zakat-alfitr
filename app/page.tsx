import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Building,
  Users,
  HandHeart,
  Shield,
  ShieldAlert,
  TrendingUp,
  Phone,
  Send,
  ArrowRight,
  Check,
} from 'lucide-react';

const features = [
  {
    icon: Building,
    title: 'Masjid-based workspaces',
    description:
      'Every masjid gets its own independent workspace, so your records stay yours.',
  },
  {
    icon: Users,
    title: 'Recipient management',
    description: 'Register and manage the families in need of your community.',
  },
  {
    icon: HandHeart,
    title: 'Donor registration',
    description: 'Record donations and donors in seconds, with nothing lost.',
  },
  {
    icon: Shield,
    title: 'Complete transparency',
    description: 'Real-time statistics and a full audit trail for every entry.',
  },
  {
    icon: ShieldAlert,
    title: 'Fraud prevention',
    description:
      'Stop recipients from registering at more than one masjid.',
  },
  {
    icon: TrendingUp,
    title: 'Better distribution',
    description:
      'Give quality, and give enough, so every family receives their share.',
  },
];

const steps = [
  {
    title: 'Register your masjid',
    description: 'Create your workspace in a few minutes.',
  },
  {
    title: 'Add recipients and donors',
    description: 'Record families in need and every donation you receive.',
  },
  {
    title: 'Distribute with confidence',
    description: 'Track what was given, to whom, and what is left.',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-green-100/80 bg-white/80 backdrop-blur-md">
        <nav className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-600 text-white shadow-sm">
              <Building className="h-5 w-5" />
            </span>
            <span className="font-semibold tracking-tight text-green-900">
              Zakat al-Fitr
            </span>
          </Link>

          <div className="hidden items-center gap-8 text-sm text-gray-600 md:flex">
            <a href="#features" className="transition-colors hover:text-green-700">
              Features
            </a>
            <a href="#how-it-works" className="transition-colors hover:text-green-700">
              How it works
            </a>
            <a href="#contact" className="transition-colors hover:text-green-700">
              Contact
            </a>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-gray-700 hover:text-green-700">
                Log in
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="rounded-full bg-green-600 px-4 hover:bg-green-700">
                Register
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-linear-to-b from-green-50 to-white">
        {/* Grid texture */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgb(22 163 74 / 0.07) 1px, transparent 1px), linear-gradient(to bottom, rgb(22 163 74 / 0.07) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            maskImage:
              'radial-gradient(ellipse 70% 60% at 50% 0%, black 30%, transparent 100%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 70% 60% at 50% 0%, black 30%, transparent 100%)',
          }}
        />
        {/* Glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[-12rem] h-[28rem] w-[56rem] -translate-x-1/2 rounded-full bg-green-400/25 blur-3xl"
        />

        <div className="container relative mx-auto px-4 pb-24 pt-20 text-center md:pt-28">
          <div className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-green-200 bg-white/80 px-3.5 py-1.5 text-sm text-green-800 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
            Built for masjids and their communities
          </div>

          <h1 className="mx-auto max-w-4xl text-5xl font-bold tracking-tight text-green-900 md:text-7xl md:leading-[1.05]">
            Zakat al-Fitr, collected and distributed with clarity
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-600 md:text-xl">
            A transparent, mosque-based system for collecting and distributing
            Zakat al-Fitr, from the first donation to the last family served.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/register">
              <Button
                size="lg"
                className="h-12 rounded-full bg-green-600 px-7 text-base shadow-lg shadow-green-600/25 hover:bg-green-700"
              >
                Register your masjid
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-green-200 bg-white px-7 text-base text-green-900 hover:bg-green-50"
              >
                Login to dashboard
              </Button>
            </Link>
          </div>

          {/* Dashboard preview */}
          <div className="relative mx-auto mt-20 max-w-5xl">
            <div
              aria-hidden
              className="absolute -inset-x-6 -bottom-10 top-10 rounded-[2rem] bg-green-300/30 blur-3xl"
            />
            <div className="relative overflow-hidden rounded-2xl border border-green-200/80 bg-white shadow-2xl shadow-green-900/10">
              {/* Window bar */}
              <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50/80 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-gray-200" />
                <span className="h-3 w-3 rounded-full bg-gray-200" />
                <span className="h-3 w-3 rounded-full bg-gray-200" />
                <div className="mx-auto hidden rounded-md bg-white px-12 py-1 text-xs text-gray-400 ring-1 ring-gray-100 sm:block">
                  Dashboard
                </div>
              </div>

              <div className="grid gap-4 p-6 text-left md:grid-cols-3 md:p-8">
                {[
                  { label: 'Donors', value: '128' },
                  { label: 'Recipient families', value: '86' },
                  { label: 'Distributed', value: '92%' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-gray-100 bg-gradient-to-b from-white to-green-50/50 p-5"
                  >
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="mt-1 text-3xl font-semibold tracking-tight text-green-800">
                      {stat.value}
                    </p>
                  </div>
                ))}

                <div className="rounded-xl border border-gray-100 p-5 md:col-span-3">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-700">
                      Recent activity
                    </p>
                    <span className="text-xs text-gray-400">Sample data</span>
                  </div>
                  <ul className="divide-y divide-gray-100 text-sm">
                    {[
                      ['Donation received', 'Recorded'],
                      ['New recipient family registered', 'Verified'],
                      ['Distribution completed', 'Done'],
                    ].map(([title, status]) => (
                      <li key={title} className="flex items-center justify-between py-3">
                        <span className="text-gray-700">{title}</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-green-200">
                          <Check className="h-3 w-3" />
                          {status}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto scroll-mt-20 px-4 py-24">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-green-900 md:text-5xl">
            Everything your masjid needs
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Simple tools that keep every collection and every distribution
            accountable.
          </p>
        </div>

        <div className="grid overflow-hidden rounded-2xl border border-gray-200 bg-gray-200 md:grid-cols-2 lg:grid-cols-3 gap-px">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group bg-white p-8 transition-colors hover:bg-green-50/60"
            >
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-green-200 bg-green-50 text-green-700 transition-colors group-hover:bg-green-600 group-hover:text-white">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="mt-2 leading-relaxed text-gray-600">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-20 border-y border-green-100 bg-green-50/50">
        <div className="container mx-auto px-4 py-24">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-green-900 md:text-5xl">
              Up and running in three steps
            </h2>
          </div>

          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
            {steps.map((step, i) => (
              <div
                key={step.title}
                className="rounded-2xl border border-green-100 bg-white p-8 shadow-sm"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-600 text-sm font-semibold text-white">
                  {i + 1}
                </span>
                <h3 className="mt-5 text-lg font-semibold text-gray-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-24">
        <div className="relative overflow-hidden rounded-3xl bg-green-800 px-6 py-16 text-center text-white md:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[40rem] -translate-x-1/2 rounded-full bg-green-500/40 blur-3xl"
          />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight md:text-5xl">
              Bring transparency to your masjid this Ramadan
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-green-100">
              Register your masjid and start recording donors and recipients today.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/register">
                <Button
                  size="lg"
                  className="h-12 rounded-full bg-white px-7 text-base text-green-800 hover:bg-green-50"
                >
                  Register your masjid
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-full border-green-400/50 bg-transparent px-7 text-base text-white hover:bg-green-700 hover:text-white"
                >
                  Login to dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="border-t border-green-900/20 bg-green-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row md:items-start">
            <div className="text-center md:text-left">
              <div className="mb-3 flex items-center justify-center gap-2.5 md:justify-start">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600">
                  <Building className="h-4 w-4" />
                </span>
                <span className="font-semibold">Zakat al-Fitr Management</span>
              </div>
              <p className="font-medium">
                Developed by Dinq labs
              </p>
              <p className="mt-1 text-sm text-green-200">Zakat Management System</p>
            </div>

            <div className="flex flex-col gap-3 text-sm sm:flex-row sm:gap-6">
              <a
                href="tel:0904004053"
                className="flex items-center justify-center gap-2 text-green-100 transition-colors hover:text-white"
              >
                <Phone className="h-4 w-4" />
                0904004053
              </a>
              <a
                href="https://t.me/programer_abdu"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-green-100 transition-colors hover:text-white"
              >
                <Send className="h-4 w-4" />
                @programer_abdu
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}