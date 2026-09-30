'use client';

import { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Building2, Users, HandCoins, Wallet, TrendingUp, Search,
  CheckCircle, Clock, Package, UserCheck, ArrowUpRight, RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const YEARS = Array.from({ length: new Date().getFullYear() - 2023 }, (_, i) => (2024 + i).toString());
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface MasjidRow {
  id: string;
  name: string;
  city: string;
  adminName: string;
  adminEmail: string;
  createdAt: any;
  mesakin: number;
  muzaki: number;
  collected: number;
  pending: number;
}

interface GlobalData {
  masjids: MasjidRow[];
  totalMesakin: number;
  totalMuzaki: number;
  totalCollected: number;
  totalPending: number;
  totalApproved: number;
  totalReceived: number;
  totalFamilies: number;
  totalDistributors: number;
  // per-year totals for charts
  yearMesakin: Record<string, number>;
  yearMuzaki: Record<string, number>;
  yearCollected: Record<string, number>;
  // monthly for selected year (across all masjids)
  monthlyMesakin: number[];
  monthlyMuzaki: number[];
  // payment methods
  paymentMethods: Record<string, number>;
  // mesakin status
  statusCounts: { pending: number; approved: number; received: number };
  // top masjids by collection
  topMasjids: { name: string; collected: number }[];
}

export default function SuperAdminDashboard() {
  const [data, setData] = useState<GlobalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [search, setSearch] = useState('');
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [masjidsSnap, distributorsSnap] = await Promise.all([
        getDocs(query(collection(db, 'masjids'), orderBy('createdAt', 'desc'))),
        getDocs(collection(db, 'distributors')),
      ]);

      const masjidList = masjidsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];

      // Fetch all years data for all masjids in parallel
      const yearMesakin: Record<string, number> = {};
      const yearMuzaki: Record<string, number> = {};
      const yearCollected: Record<string, number> = {};
      const monthlyMesakin = Array(12).fill(0);
      const monthlyMuzaki = Array(12).fill(0);
      const paymentMethods: Record<string, number> = {};
      const statusCounts = { pending: 0, approved: 0, received: 0 };

      YEARS.forEach(y => { yearMesakin[y] = 0; yearMuzaki[y] = 0; yearCollected[y] = 0; });

      // Per-masjid stats for selected year
      const masjidRows: MasjidRow[] = [];

      await Promise.all(masjidList.map(async (masjid) => {
        let masjidMesakin = 0, masjidMuzaki = 0, masjidCollected = 0, masjidPending = 0;

        await Promise.all(YEARS.map(async (year) => {
          const [mSnap, zSnap] = await Promise.all([
            getDocs(query(collection(db, 'mesakin', year, 'records'), where('masjidId', '==', masjid.id))),
            getDocs(query(collection(db, 'muzaki', year, 'records'), where('masjidId', '==', masjid.id))),
          ]);

          const mData = mSnap.docs.map(d => d.data());
          const zData = zSnap.docs.map(d => d.data());
          const collected = zData.reduce((s, m) => s + (m.amount || 0) + (m.extra || 0), 0);

          yearMesakin[year] = (yearMesakin[year] || 0) + mData.length;
          yearMuzaki[year] = (yearMuzaki[year] || 0) + zData.length;
          yearCollected[year] = (yearCollected[year] || 0) + collected;

          if (year === selectedYear) {
            masjidMesakin += mData.length;
            masjidMuzaki += zData.length;
            masjidCollected += collected;
            masjidPending += mData.filter(m => m.status === 'pending').length;

            mData.forEach(m => {
              const d = m.registeredAt?.toDate?.();
              if (d) monthlyMesakin[d.getMonth()]++;
              if (m.status === 'pending') statusCounts.pending++;
              else if (m.status === 'approved') statusCounts.approved++;
              else if (m.status === 'received') statusCounts.received++;
            });

            zData.forEach(m => {
              const d = m.registeredAt?.toDate?.();
              if (d) monthlyMuzaki[d.getMonth()]++;
              const pm = m.paymentMethod || 'cash';
              paymentMethods[pm] = (paymentMethods[pm] || 0) + 1;
            });
          }
        }));

        masjidRows.push({
          id: masjid.id,
          name: masjid.name || 'Unknown',
          city: masjid.city || 'N/A',
          adminName: masjid.adminName || 'N/A',
          adminEmail: masjid.adminEmail || 'N/A',
          createdAt: masjid.createdAt,
          mesakin: masjidMesakin,
          muzaki: masjidMuzaki,
          collected: masjidCollected,
          pending: masjidPending,
        });
      }));

      const topMasjids = [...masjidRows]
        .sort((a, b) => b.collected - a.collected)
        .slice(0, 5)
        .map(m => ({ name: m.name, collected: m.collected }));

      setData({
        masjids: masjidRows,
        totalMesakin: yearMesakin[selectedYear] || 0,
        totalMuzaki: yearMuzaki[selectedYear] || 0,
        totalCollected: yearCollected[selectedYear] || 0,
        totalPending: statusCounts.pending,
        totalApproved: statusCounts.approved,
        totalReceived: statusCounts.received,
        totalFamilies: masjidRows.reduce((s, m) => s + m.muzaki, 0),
        totalDistributors: distributorsSnap.size,
        yearMesakin,
        yearMuzaki,
        yearCollected,
        monthlyMesakin,
        monthlyMuzaki,
        paymentMethods,
        statusCounts,
        topMasjids,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  };

  useEffect(() => { fetchAll(); }, [selectedYear]);

  const filteredMasjids = useMemo(() =>
    (data?.masjids ?? []).filter(m =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.city.toLowerCase().includes(search.toLowerCase()) ||
      m.adminName.toLowerCase().includes(search.toLowerCase())
    ), [data, search]);

  const statCards = data ? [
    { label: 'Total Masjids', value: data.masjids.length, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Mesakin', value: data.totalMesakin, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Total Muzaki', value: data.totalMuzaki, icon: HandCoins, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Collected', value: `${data.totalCollected.toLocaleString()} ETB`, icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Pending', value: data.totalPending, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Approved', value: data.totalApproved, icon: CheckCircle, color: 'text-teal-600', bg: 'bg-teal-50' },
    { label: 'Received', value: data.totalReceived, icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Distributors', value: data.totalDistributors, icon: UserCheck, color: 'text-rose-600', bg: 'bg-rose-50' },
  ] : [];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" />
        <p className="text-sm text-gray-500">Loading system data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">System Overview</h1>
          <p className="text-sm text-gray-500 mt-0.5">Last updated: {format(lastRefresh, 'HH:mm:ss')}</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
            className="px-3 py-2 border rounded-md bg-white text-sm font-medium"
          >
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <Button variant="outline" size="sm" onClick={fetchAll}>
            <RefreshCw className="h-4 w-4 mr-1" /> Refresh
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label}>
            <CardContent className="pt-4 pb-3 px-4">
              <div className={`inline-flex p-2 rounded-lg ${bg} mb-2`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <div className="text-xl font-bold leading-tight">{value}</div>
              <p className="text-xs text-gray-500 mt-0.5 leading-tight">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Row 1: Monthly trend + Coverage gauge */}
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
                fill: { type: 'gradient', gradient: { opacityFrom: 0.35, opacityTo: 0.05 } },
                xaxis: { categories: MONTHS },
                yaxis: { labels: { formatter: (v: number) => Math.round(v).toString() } },
                colors: ['#16a34a', '#7c3aed'],
                legend: { position: 'top' },
                tooltip: { shared: true, intersect: false },
                grid: { borderColor: '#f0f0f0' },
              }}
              series={[
                { name: 'Mesakin', data: data?.monthlyMesakin ?? [] },
                { name: 'Muzaki', data: data?.monthlyMuzaki ?? [] },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Mesakin Status — {selectedYear}</CardTitle>
          </CardHeader>
          <CardContent>
            <Chart
              type="donut"
              height={260}
              options={{
                labels: ['Pending', 'Approved', 'Received'],
                colors: ['#fbbf24', '#34d399', '#60a5fa'],
                legend: { position: 'bottom', fontSize: '12px' },
                dataLabels: { enabled: true, formatter: (v: number) => `${Math.round(v)}%` },
                plotOptions: { pie: { donut: { size: '55%' } } },
                stroke: { width: 0 },
              }}
              series={[
                data?.statusCounts.pending ?? 0,
                data?.statusCounts.approved ?? 0,
                data?.statusCounts.received ?? 0,
              ]}
            />
          </CardContent>
        </Card>
      </div>

      {/* Row 2: YoY bars + collection line + payment pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Year-over-Year Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <Chart
              type="bar"
              height={220}
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
                { name: 'Mesakin', data: YEARS.map(y => data?.yearMesakin[y] ?? 0) },
                { name: 'Muzaki', data: YEARS.map(y => data?.yearMuzaki[y] ?? 0) },
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
              height={220}
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
              series={[{ name: 'Collected', data: YEARS.map(y => data?.yearCollected[y] ?? 0) }]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Payment Methods — {selectedYear}</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(data?.paymentMethods ?? {}).length > 0 ? (
              <Chart
                type="pie"
                height={220}
                options={{
                  labels: Object.keys(data!.paymentMethods).map(l => l.charAt(0).toUpperCase() + l.slice(1)),
                  colors: ['#6366f1', '#f59e0b', '#10b981'],
                  legend: { position: 'bottom', fontSize: '12px' },
                  dataLabels: { enabled: true, formatter: (v: number) => `${Math.round(v)}%` },
                  stroke: { width: 0 },
                }}
                series={Object.values(data!.paymentMethods)}
              />
            ) : (
              <div className="flex items-center justify-center h-[220px] text-gray-400 text-sm">No data</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Top masjids bar + per-masjid collection horizontal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top 5 Masjids by Collection — {selectedYear}</CardTitle>
          </CardHeader>
          <CardContent>
            {(data?.topMasjids ?? []).length > 0 ? (
              <Chart
                type="bar"
                height={240}
                options={{
                  chart: { toolbar: { show: false } },
                  plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: '55%' } },
                  xaxis: { labels: { formatter: (v: number) => `${(v / 1000).toFixed(0)}k` } },
                  yaxis: { labels: { style: { fontSize: '12px' } } },
                  colors: ['#16a34a'],
                  dataLabels: { enabled: false },
                  grid: { borderColor: '#f0f0f0' },
                  tooltip: { y: { formatter: (v: number) => `${v.toLocaleString()} ETB` } },
                }}
                series={[{
                  name: 'Collected',
                  data: (data?.topMasjids ?? []).map(m => ({
                    x: m.name.length > 18 ? m.name.slice(0, 18) + '…' : m.name,
                    y: m.collected,
                  })),
                }]}
              />
            ) : (
              <div className="flex items-center justify-center h-[240px] text-gray-400 text-sm">No data</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Masjid Activity Heatmap — {selectedYear}</CardTitle>
          </CardHeader>
          <CardContent>
            {(data?.masjids ?? []).length > 0 ? (
              <Chart
                type="bar"
                height={240}
                options={{
                  chart: { toolbar: { show: false }, stacked: true },
                  plotOptions: { bar: { borderRadius: 3, columnWidth: '60%' } },
                  xaxis: {
                    categories: (data?.masjids ?? []).slice(0, 8).map(m =>
                      m.name.length > 10 ? m.name.slice(0, 10) + '…' : m.name
                    ),
                    labels: { style: { fontSize: '11px' } },
                  },
                  yaxis: { labels: { formatter: (v: number) => Math.round(v).toString() } },
                  colors: ['#16a34a', '#7c3aed', '#f59e0b'],
                  dataLabels: { enabled: false },
                  legend: { position: 'top', fontSize: '12px' },
                  grid: { borderColor: '#f0f0f0' },
                }}
                series={[
                  { name: 'Mesakin', data: (data?.masjids ?? []).slice(0, 8).map(m => m.mesakin) },
                  { name: 'Muzaki', data: (data?.masjids ?? []).slice(0, 8).map(m => m.muzaki) },
                  { name: 'Pending', data: (data?.masjids ?? []).slice(0, 8).map(m => m.pending) },
                ]}
              />
            ) : (
              <div className="flex items-center justify-center h-[240px] text-gray-400 text-sm">No data</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Masjids Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-base">All Masjids — {selectedYear} ({filteredMasjids.length})</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search masjids..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 h-8 text-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Masjid</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead className="text-right">Mesakin</TableHead>
                  <TableHead className="text-right">Muzaki</TableHead>
                  <TableHead className="text-right">Collected</TableHead>
                  <TableHead className="text-right">Pending</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMasjids.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-400">No masjids found</TableCell>
                  </TableRow>
                ) : filteredMasjids.map(m => (
                  <TableRow key={m.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell className="text-gray-500">{m.city}</TableCell>
                    <TableCell>
                      <div className="text-sm">{m.adminName}</div>
                      <div className="text-xs text-gray-400">{m.adminEmail}</div>
                    </TableCell>
                    <TableCell className="text-right">{m.mesakin}</TableCell>
                    <TableCell className="text-right">{m.muzaki}</TableCell>
                    <TableCell className="text-right font-medium text-green-700">{m.collected.toLocaleString()} ETB</TableCell>
                    <TableCell className="text-right">
                      {m.pending > 0 ? (
                        <Badge className="bg-yellow-100 text-yellow-800">{m.pending}</Badge>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      {m.createdAt?.toDate ? format(m.createdAt.toDate(), 'MMM dd, yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Link href={`/admin/dashboard/masjids/${m.id}`}>
                        <Button variant="ghost" size="sm">
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
