'use client';

import { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { useMasjid } from '@/contexts/MasjidContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Wallet, Users2, Package, TrendingUp, Clock, CheckCircle, Gift } from 'lucide-react';
import { useTranslations } from 'next-intl';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const YEARS = Array.from({ length: new Date().getFullYear() - 2023 }, (_, i) => (2024 + i).toString());
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface YearData {
  mesakin: any[];
  muzaki: any[];
}

export default function DashboardPage() {
  const { masjidId } = useAuth();
  const { config } = useMasjid();
  const t = useTranslations('dashboard');
  const [yearData, setYearData] = useState<Record<string, YearData>>({});
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!masjidId) return;
    const fetchAll = async () => {
      setLoading(true);
      const result: Record<string, YearData> = {};
      await Promise.all(
        YEARS.map(async (year) => {
          const [mesakinSnap, muzakiSnap] = await Promise.all([
            getDocs(query(collection(db, 'mesakin', year, 'records'), where('masjidId', '==', masjidId))),
            getDocs(query(collection(db, 'muzaki', year, 'records'), where('masjidId', '==', masjidId))),
          ]);
          result[year] = {
            mesakin: mesakinSnap.docs.map(d => d.data()),
            muzaki: muzakiSnap.docs.map(d => d.data()),
          };
        })
      );
      setYearData(result);
      setLoading(false);
    };
    fetchAll();
  }, [masjidId]);

  const current = yearData[selectedYear] ?? { mesakin: [], muzaki: [] };

  const stats = useMemo(() => {
    const totalCollected = current.muzaki.reduce((s, m) => s + (m.amount || 0) + (m.extra || 0), 0);
    const totalFamilies = current.muzaki.reduce((s, m) => s + (m.peopleCount || 0), 0);
    const packageCost = config?.packageCost || 100;
    const needed = current.mesakin.length * packageCost;
    const coverage = needed > 0 ? Math.min(100, Math.round((totalCollected / needed) * 100)) : 0;
    return {
      totalMesakin: current.mesakin.length,
      totalMuzaki: current.muzaki.length,
      totalCollected,
      totalFamilies,
      pending: current.mesakin.filter(m => m.status === 'pending').length,
      approved: current.mesakin.filter(m => m.status === 'approved').length,
      received: current.mesakin.filter(m => m.status === 'received').length,
      needed,
      coverage,
    };
  }, [current, config]);

  // Monthly registrations for selected year
  const monthlyData = useMemo(() => {
    const mesakinMonths = Array(12).fill(0);
    const muzakiMonths = Array(12).fill(0);
    current.mesakin.forEach(m => {
      const d = m.registeredAt?.toDate?.();
      if (d) mesakinMonths[d.getMonth()]++;
    });
    current.muzaki.forEach(m => {
      const d = m.registeredAt?.toDate?.();
      if (d) muzakiMonths[d.getMonth()]++;
    });
    return { mesakinMonths, muzakiMonths };
  }, [current]);

  // Year-over-year comparison
  const yoyData = useMemo(() => ({
    categories: YEARS,
    mesakin: YEARS.map(y => yearData[y]?.mesakin.length ?? 0),
    muzaki: YEARS.map(y => yearData[y]?.muzaki.length ?? 0),
    collected: YEARS.map(y =>
      (yearData[y]?.muzaki ?? []).reduce((s, m) => s + (m.amount || 0) + (m.extra || 0), 0)
    ),
  }), [yearData]);

  // Payment methods
  const paymentMethods = useMemo(() => {
    const counts: Record<string, number> = {};
    current.muzaki.forEach(m => {
      const method = m.paymentMethod || 'cash';
      counts[method] = (counts[method] || 0) + 1;
    });
    return { labels: Object.keys(counts), series: Object.values(counts) };
  }, [current]);

  // Family size distribution
  const familyDist = useMemo(() => {
    const buckets = { '1': 0, '2-3': 0, '4-5': 0, '6+': 0 };
    current.mesakin.forEach(m => {
      const n = m.familyMembers || 1;
      if (n === 1) buckets['1']++;
      else if (n <= 3) buckets['2-3']++;
      else if (n <= 5) buckets['4-5']++;
      else buckets['6+']++;
    });
    return { labels: Object.keys(buckets), series: Object.values(buckets) };
  }, [current]);

  const statCards = [
    { label: t('totalMesakin'), value: stats.totalMesakin, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: t('totalMuzaki'), value: stats.totalMuzaki, icon: Users2, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: t('totalCollected'), value: `${stats.totalCollected.toLocaleString()} ETB`, icon: Wallet, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Donor Families', value: stats.totalFamilies, icon: Gift, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'text-teal-600', bg: 'bg-teal-50' },
    { label: 'Received', value: stats.received, icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Coverage', value: `${stats.coverage}%`, icon: TrendingUp, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">{t('title')}</h1>
        <select
          value={selectedYear}
          onChange={e => setSelectedYear(e.target.value)}
          className="px-3 py-2 border rounded-md bg-white text-sm font-medium"
        >
          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="col-span-1">
            <CardContent className="pt-4 pb-3 px-4">
              <div className={`inline-flex p-2 rounded-lg ${bg} mb-2`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <div className="text-xl font-bold">{value}</div>
              <p className="text-xs text-gray-500 mt-0.5 leading-tight">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Row 1: Monthly Trend + Coverage Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Monthly Registrations — {selectedYear}</CardTitle>
          </CardHeader>
          <CardContent>
            <Chart
              type="area"
              height={260}
              options={{
                chart: { toolbar: { show: false }, zoom: { enabled: false } },
                dataLabels: { enabled: false },
                stroke: { curve: 'smooth', width: 2 },
                fill: { type: 'gradient', gradient: { opacityFrom: 0.4, opacityTo: 0.05 } },
                xaxis: { categories: MONTHS },
                yaxis: { labels: { formatter: (v: number) => Math.round(v).toString() } },
                colors: ['#16a34a', '#7c3aed'],
                legend: { position: 'top' },
                tooltip: { shared: true, intersect: false },
                grid: { borderColor: '#f0f0f0' },
              }}
              series={[
                { name: 'Mesakin', data: monthlyData.mesakinMonths },
                { name: 'Muzaki', data: monthlyData.muzakiMonths },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Collection Coverage</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Chart
              type="radialBar"
              height={220}
              options={{
                chart: { toolbar: { show: false } },
                plotOptions: {
                  radialBar: {
                    startAngle: -135,
                    endAngle: 135,
                    hollow: { size: '60%' },
                    dataLabels: {
                      name: { show: true, offsetY: -10, fontSize: '12px', color: '#6b7280' },
                      value: { fontSize: '24px', fontWeight: 700, color: '#111827', formatter: (v: number) => `${v}%` },
                    },
                    track: { background: '#f3f4f6' },
                  },
                },
                fill: {
                  type: 'gradient',
                  gradient: { shade: 'dark', type: 'horizontal', gradientToColors: ['#16a34a'], stops: [0, 100] },
                },
                colors: ['#4ade80'],
                labels: ['Coverage'],
              }}
              series={[stats.coverage]}
            />
            <div className="text-center mt-1">
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-green-600">{stats.totalCollected.toLocaleString()} ETB</span> collected
              </p>
              <p className="text-sm text-gray-500">
                of <span className="font-semibold">{stats.needed.toLocaleString()} ETB</span> needed
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Mesakin Status + Payment Methods + Family Size */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Mesakin Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Chart
              type="donut"
              height={220}
              options={{
                labels: ['Pending', 'Approved', 'Received'],
                colors: ['#fbbf24', '#34d399', '#60a5fa'],
                legend: { position: 'bottom', fontSize: '12px' },
                dataLabels: { enabled: true, formatter: (v: number) => `${Math.round(v)}%` },
                plotOptions: { pie: { donut: { size: '55%' } } },
                stroke: { width: 0 },
              }}
              series={[stats.pending, stats.approved, stats.received]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            {paymentMethods.series.length > 0 ? (
              <Chart
                type="pie"
                height={220}
                options={{
                  labels: paymentMethods.labels.map(l => l.charAt(0).toUpperCase() + l.slice(1)),
                  colors: ['#6366f1', '#f59e0b', '#10b981'],
                  legend: { position: 'bottom', fontSize: '12px' },
                  dataLabels: { enabled: true, formatter: (v: number) => `${Math.round(v)}%` },
                  stroke: { width: 0 },
                }}
                series={paymentMethods.series}
              />
            ) : (
              <div className="flex items-center justify-center h-[220px] text-gray-400 text-sm">No data</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Family Size Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {familyDist.series.some(v => v > 0) ? (
              <Chart
                type="bar"
                height={220}
                options={{
                  chart: { toolbar: { show: false } },
                  xaxis: { categories: familyDist.labels },
                  yaxis: { labels: { formatter: (v: number) => Math.round(v).toString() } },
                  colors: ['#8b5cf6'],
                  dataLabels: { enabled: false },
                  plotOptions: { bar: { borderRadius: 4, columnWidth: '50%' } },
                  grid: { borderColor: '#f0f0f0' },
                }}
                series={[{ name: 'Families', data: familyDist.series }]}
              />
            ) : (
              <div className="flex items-center justify-center h-[220px] text-gray-400 text-sm">No data</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Year-over-Year */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Year-over-Year Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <Chart
              type="bar"
              height={240}
              options={{
                chart: { toolbar: { show: false } },
                xaxis: { categories: yoyData.categories },
                yaxis: { labels: { formatter: (v: number) => Math.round(v).toString() } },
                colors: ['#16a34a', '#7c3aed'],
                dataLabels: { enabled: false },
                plotOptions: { bar: { borderRadius: 4, columnWidth: '55%', } },
                legend: { position: 'top' },
                grid: { borderColor: '#f0f0f0' },
              }}
              series={[
                { name: 'Mesakin', data: yoyData.mesakin },
                { name: 'Muzaki', data: yoyData.muzaki },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Year-over-Year Collection (ETB)</CardTitle>
          </CardHeader>
          <CardContent>
            <Chart
              type="line"
              height={240}
              options={{
                chart: { toolbar: { show: false }, zoom: { enabled: false } },
                xaxis: { categories: yoyData.categories },
                yaxis: { labels: { formatter: (v: number) => `${(v / 1000).toFixed(0)}k` } },
                colors: ['#f59e0b'],
                stroke: { curve: 'smooth', width: 3 },
                markers: { size: 5 },
                dataLabels: { enabled: false },
                grid: { borderColor: '#f0f0f0' },
                tooltip: { y: { formatter: (v: number) => `${v.toLocaleString()} ETB` } },
              }}
              series={[{ name: 'Collected', data: yoyData.collected }]}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
