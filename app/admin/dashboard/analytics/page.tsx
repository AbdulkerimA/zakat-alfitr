'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const YEARS = Array.from({ length: new Date().getFullYear() - 2023 }, (_, i) => (2024 + i).toString());
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  // Aggregated data
  const [monthlyMesakin, setMonthlyMesakin] = useState<number[]>(Array(12).fill(0));
  const [monthlyMuzaki, setMonthlyMuzaki] = useState<number[]>(Array(12).fill(0));
  const [monthlyCollected, setMonthlyCollected] = useState<number[]>(Array(12).fill(0));
  const [yoyMesakin, setYoyMesakin] = useState<number[]>([]);
  const [yoyMuzaki, setYoyMuzaki] = useState<number[]>([]);
  const [yoyCollected, setYoyCollected] = useState<number[]>([]);
  const [familySizeDist, setFamilySizeDist] = useState<number[]>([0, 0, 0, 0]);
  const [paymentMethods, setPaymentMethods] = useState<{ labels: string[]; series: number[] }>({ labels: [], series: [] });
  const [statusSeries, setStatusSeries] = useState([0, 0, 0]);
  const [masjidGrowth, setMasjidGrowth] = useState<number[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const masjidsSnap = await getDocs(collection(db, 'masjids'));
      const masjidIds = masjidsSnap.docs.map(d => d.id);

      // Masjid growth per year (cumulative)
      const masjidByYear: Record<string, number> = {};
      masjidsSnap.docs.forEach(d => {
        const date = d.data().createdAt?.toDate?.();
        if (date) {
          const y = date.getFullYear().toString();
          masjidByYear[y] = (masjidByYear[y] || 0) + 1;
        }
      });
      let cumulative = 0;
      setMasjidGrowth(YEARS.map(y => { cumulative += masjidByYear[y] || 0; return cumulative; }));

      // YoY aggregates
      const yM: number[] = [], yZ: number[] = [], yC: number[] = [];
      for (const year of YEARS) {
        let mCount = 0, zCount = 0, collected = 0;
        for (const mid of masjidIds) {
          const [mSnap, zSnap] = await Promise.all([
            getDocs(query(collection(db, 'mesakin', year, 'records'), where('masjidId', '==', mid))),
            getDocs(query(collection(db, 'muzaki', year, 'records'), where('masjidId', '==', mid))),
          ]);
          mCount += mSnap.size;
          zCount += zSnap.size;
          collected += zSnap.docs.reduce((s, d) => s + (d.data().amount || 0) + (d.data().extra || 0), 0);
        }
        yM.push(mCount); yZ.push(zCount); yC.push(collected);
      }
      setYoyMesakin(yM); setYoyMuzaki(yZ); setYoyCollected(yC);

      // Monthly + distributions for selected year
      const mm = Array(12).fill(0), mz = Array(12).fill(0), mc = Array(12).fill(0);
      const fam = [0, 0, 0, 0]; // 1, 2-3, 4-5, 6+
      const pm: Record<string, number> = {};
      let pending = 0, approved = 0, received = 0;

      for (const mid of masjidIds) {
        const [mSnap, zSnap] = await Promise.all([
          getDocs(query(collection(db, 'mesakin', selectedYear, 'records'), where('masjidId', '==', mid))),
          getDocs(query(collection(db, 'muzaki', selectedYear, 'records'), where('masjidId', '==', mid))),
        ]);
        mSnap.docs.forEach(d => {
          const data = d.data();
          const date = data.registeredAt?.toDate?.();
          if (date) mm[date.getMonth()]++;
          const n = data.familyMembers || 1;
          if (n === 1) fam[0]++;
          else if (n <= 3) fam[1]++;
          else if (n <= 5) fam[2]++;
          else fam[3]++;
          if (data.status === 'pending') pending++;
          else if (data.status === 'approved') approved++;
          else if (data.status === 'received') received++;
        });
        zSnap.docs.forEach(d => {
          const data = d.data();
          const date = data.registeredAt?.toDate?.();
          if (date) { mz[date.getMonth()]++; mc[date.getMonth()] += (data.amount || 0) + (data.extra || 0); }
          const method = data.paymentMethod || 'cash';
          pm[method] = (pm[method] || 0) + 1;
        });
      }

      setMonthlyMesakin(mm);
      setMonthlyMuzaki(mz);
      setMonthlyCollected(mc);
      setFamilySizeDist(fam);
      setPaymentMethods({ labels: Object.keys(pm).map(l => l.charAt(0).toUpperCase() + l.slice(1)), series: Object.values(pm) });
      setStatusSeries([pending, approved, received]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [selectedYear]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" />
        <p className="text-sm text-gray-500">Crunching numbers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">Analytics</h1>
        <div className="flex gap-2">
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
            className="px-3 py-2 border rounded-md bg-white text-sm font-medium"
          >
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Monthly registrations + collections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Monthly Registrations — {selectedYear}</CardTitle>
          </CardHeader>
          <CardContent>
            <Chart
              type="area"
              height={240}
              options={{
                chart: { toolbar: { show: false }, zoom: { enabled: false } },
                dataLabels: { enabled: false },
                stroke: { curve: 'smooth', width: 2 },
                fill: { type: 'gradient', gradient: { opacityFrom: 0.35, opacityTo: 0.05 } },
                xaxis: { categories: MONTHS },
                yaxis: { labels: { formatter: (v: number) => Math.round(v).toString() } },
                colors: ['#16a34a', '#7c3aed'],
                legend: { position: 'top' },
                tooltip: { shared: true, intersect: false },
                grid: { borderColor: '#f0f0f0' },
              }}
              series={[
                { name: 'Mesakin', data: monthlyMesakin },
                { name: 'Muzaki', data: monthlyMuzaki },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Monthly Collections (ETB) — {selectedYear}</CardTitle>
          </CardHeader>
          <CardContent>
            <Chart
              type="bar"
              height={240}
              options={{
                chart: { toolbar: { show: false } },
                xaxis: { categories: MONTHS },
                yaxis: { labels: { formatter: (v: number) => `${(v / 1000).toFixed(0)}k` } },
                colors: ['#f59e0b'],
                dataLabels: { enabled: false },
                plotOptions: { bar: { borderRadius: 4, columnWidth: '55%' } },
                grid: { borderColor: '#f0f0f0' },
                tooltip: { y: { formatter: (v: number) => `${v.toLocaleString()} ETB` } },
              }}
              series={[{ name: 'Collected', data: monthlyCollected }]}
            />
          </CardContent>
        </Card>
      </div>

      {/* YoY */}
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
                xaxis: { categories: YEARS },
                yaxis: { labels: { formatter: (v: number) => Math.round(v).toString() } },
                colors: ['#16a34a', '#7c3aed'],
                dataLabels: { enabled: false },
                plotOptions: { bar: { borderRadius: 4, columnWidth: '55%' } },
                legend: { position: 'top' },
                grid: { borderColor: '#f0f0f0' },
              }}
              series={[
                { name: 'Mesakin', data: yoyMesakin },
                { name: 'Muzaki', data: yoyMuzaki },
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
                xaxis: { categories: YEARS },
                yaxis: { labels: { formatter: (v: number) => `${(v / 1000).toFixed(0)}k` } },
                colors: ['#f59e0b'],
                stroke: { curve: 'smooth', width: 3 },
                markers: { size: 5 },
                dataLabels: { enabled: false },
                grid: { borderColor: '#f0f0f0' },
                tooltip: { y: { formatter: (v: number) => `${v.toLocaleString()} ETB` } },
              }}
              series={[{ name: 'Collected', data: yoyCollected }]}
            />
          </CardContent>
        </Card>
      </div>

      {/* Distributions + family size + payment + status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Mesakin Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Chart
              type="donut"
              height={200}
              options={{
                labels: ['Pending', 'Approved', 'Received'],
                colors: ['#fbbf24', '#34d399', '#60a5fa'],
                legend: { position: 'bottom', fontSize: '11px' },
                dataLabels: { enabled: true, formatter: (v: number) => `${Math.round(v)}%` },
                plotOptions: { pie: { donut: { size: '55%' } } },
                stroke: { width: 0 },
              }}
              series={statusSeries}
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
                height={200}
                options={{
                  labels: paymentMethods.labels,
                  colors: ['#6366f1', '#f59e0b', '#10b981'],
                  legend: { position: 'bottom', fontSize: '11px' },
                  dataLabels: { enabled: true, formatter: (v: number) => `${Math.round(v)}%` },
                  stroke: { width: 0 },
                }}
                series={paymentMethods.series}
              />
            ) : <div className="flex items-center justify-center h-[200px] text-gray-400 text-sm">No data</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Family Size Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <Chart
              type="bar"
              height={200}
              options={{
                chart: { toolbar: { show: false } },
                xaxis: { categories: ['1', '2-3', '4-5', '6+'] },
                yaxis: { labels: { formatter: (v: number) => Math.round(v).toString() } },
                colors: ['#8b5cf6'],
                dataLabels: { enabled: false },
                plotOptions: { bar: { borderRadius: 4, columnWidth: '50%' } },
                grid: { borderColor: '#f0f0f0' },
              }}
              series={[{ name: 'Families', data: familySizeDist }]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Masjid Growth (Cumulative)</CardTitle>
          </CardHeader>
          <CardContent>
            <Chart
              type="line"
              height={200}
              options={{
                chart: { toolbar: { show: false }, zoom: { enabled: false } },
                xaxis: { categories: YEARS },
                yaxis: { labels: { formatter: (v: number) => Math.round(v).toString() } },
                colors: ['#0ea5e9'],
                stroke: { curve: 'smooth', width: 3 },
                markers: { size: 4 },
                dataLabels: { enabled: false },
                fill: { type: 'gradient', gradient: { opacityFrom: 0.3, opacityTo: 0.05 } },
                grid: { borderColor: '#f0f0f0' },
              }}
              series={[{ name: 'Masjids', data: masjidGrowth }]}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
