import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { BarChart3, TrendingUp, Users, RefreshCw, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, Badge } from '@/components/ui/Badge';
import { fetchGymAnalytics, type TimeRangeOption, type FullAnalyticsData } from '@/services/analyticsService';

export const AnalyticsPage: React.FC = () => {
  const { gym, profile } = useAuth();
  const [timeRange, setTimeRange] = useState<TimeRangeOption>('30d');
  const [data, setData] = useState<FullAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const gymId = gym?.gymId || profile?.gymId || '';

  useEffect(() => {
    if (!gymId) return;
    const load = async () => {
      try {
        setLoading(true);
        const result = await fetchGymAnalytics(gymId, timeRange);
        setData(result);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [gymId, timeRange]);

  const ranges: { label: string; value: TimeRangeOption }[] = [
    { label: 'Last 7 Days', value: '7d' },
    { label: 'Last 30 Days', value: '30d' },
    { label: 'Last 3 Months', value: '3m' },
    { label: 'Last 6 Months', value: '6m' },
    { label: 'Last 12 Months', value: '12m' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Business Analytics & Retention
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real revenue metrics, member growth curves, and retention rates computed from Firestore
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 p-1 rounded-xl">
          {ranges.map((r) => (
            <button
              key={r.value}
              onClick={() => setTimeRange(r.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                timeRange === r.value
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading || !data ? (
        <p className="text-xs text-zinc-500 py-16 text-center">Aggregating real Firestore analytics...</p>
      ) : (
        <>
          {/* Summary Metric Ribbon */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <p className="text-xs text-zinc-400">Total Revenue (Selected Range)</p>
              <p className="text-2xl font-extrabold text-emerald-400 mt-1">
                ₹{data.summary.totalRevenueInRange.toLocaleString()}
              </p>
              <span className="text-[10px] text-zinc-500 mt-1 block">New & renewal memberships</span>
            </Card>

            <Card>
              <p className="text-xs text-zinc-400">New Members (Selected Range)</p>
              <p className="text-2xl font-extrabold text-white mt-1">
                +{data.summary.newMembersInRange}
              </p>
              <span className="text-[10px] text-zinc-500 mt-1 block">Joined within timeframe</span>
            </Card>

            <Card>
              <p className="text-xs text-zinc-400">Renewals Processed</p>
              <p className="text-2xl font-extrabold text-white mt-1">
                {data.summary.renewalsInRange}
              </p>
              <span className="text-[10px] text-zinc-500 mt-1 block">Completed renewal cycles</span>
            </Card>

            <Card>
              <p className="text-xs text-zinc-400">Overall Renewal Rate</p>
              <p className="text-2xl font-extrabold text-white mt-1">
                {data.summary.renewalRate}%
              </p>
              <span className="text-[10px] text-zinc-500 mt-1 block">Retention efficiency</span>
            </Card>
          </div>

          {/* Charts Row 1: Growth & Revenue */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Growth Curve */}
            <Card className="flex flex-col">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-white">Cumulative Member Growth</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Total registered members trajectory</p>
              </div>

              <div className="h-64 w-full">
                {data.growthSeries.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-zinc-500">
                    No member registration records found.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.growthSeries}>
                      <defs>
                        <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="date" stroke="#71717a" fontSize={10} tickLine={false} />
                      <YAxis stroke="#71717a" fontSize={10} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '11px' }} />
                      <Area type="monotone" dataKey="cumulativeMembers" name="Members" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#growthGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>

            {/* Revenue Trend */}
            <Card className="flex flex-col">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-white">Monthly Revenue Trends</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Income generated through memberships (₹)</p>
              </div>

              <div className="h-64 w-full">
                {data.revenueSeries.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-zinc-500">
                    No payment history recorded yet.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.revenueSeries}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="period" stroke="#71717a" fontSize={10} tickLine={false} />
                      <YAxis stroke="#71717a" fontSize={10} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '11px' }} />
                      <Bar dataKey="revenue" name="Revenue (₹)" fill="#059669" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>
          </div>

          {/* Charts Row 2: Distribution & Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Plan Distribution */}
            <Card className="flex flex-col">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-white">Membership Plan Popularity</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Active subscriptions by tier</p>
              </div>

              <div className="h-64 w-full">
                {data.planDistribution.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-zinc-500">
                    No plans assigned to members yet.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.planDistribution} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis type="number" stroke="#71717a" fontSize={10} tickLine={false} />
                      <YAxis type="category" dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} width={130} />
                      <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '11px' }} />
                      <Bar dataKey="count" name="Subscribers" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>

            {/* Active vs Expired */}
            <Card className="flex flex-col">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-white">Membership Status Breakdown</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Active vs Expiring Soon vs Expired</p>
              </div>

              <div className="h-64 w-full flex items-center justify-center">
                {data.summary.totalMembers === 0 ? (
                  <p className="text-xs text-zinc-500">No members registered yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.activeVsExpired}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {data.activeVsExpired.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="flex items-center justify-center gap-6 text-xs text-zinc-400 mt-2">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Active ({data.summary.activeMembers})</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Expiring ({data.summary.expiringSoonMembers})</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Expired ({data.summary.expiredMembers})</span>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};
