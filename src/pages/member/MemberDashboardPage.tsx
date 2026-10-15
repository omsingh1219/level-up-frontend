import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ShoppingBag,
  AlertCircle,
  Bell,
  ArrowRight,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Badge, Card } from '@/components/ui/Badge';
import { getMemberMemberships } from '@/services/membershipService';
import { getComplaints } from '@/services/complaintService';
import { getNotifications } from '@/services/notificationService';
import { formatReadableDate, calculateDaysRemaining } from '@/utils/dateUtils';
import type { Membership, Complaint, AppNotification } from '@/types';

export const MemberDashboardPage: React.FC = () => {
  const { profile, gym } = useAuth();
  const [membership, setMembership] = useState<Membership | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const gymId = gym?.gymId || profile?.gymId || '';
  const memberId = profile?.uid || 'member-demo-rahul';

  useEffect(() => {
    if (!gymId) return;
    const load = async () => {
      try {
        setLoading(true);
        // Find member's memberships
        const msList = await getMemberMemberships(gymId, memberId);
        // Also check if member linked by email or member-1
        let activeMs = msList[0] || null;

        if (!activeMs) {
          const fallbackList = await getMemberMemberships(gymId, 'member-1');
          if (fallbackList.length > 0) activeMs = fallbackList[0];
        }

        setMembership(activeMs);

        const [cList, nList] = await Promise.all([
          getComplaints(gymId, memberId),
          getNotifications(gymId, profile?.uid, 5),
        ]);
        setComplaints(cList);
        setNotifications(nList);
      } catch (err) {
        console.error('Failed to load member dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [gymId, memberId, profile?.uid]);

  const daysRemaining = membership ? calculateDaysRemaining(membership.expiryDate) : null;
  const isExpiring = daysRemaining !== null && daysRemaining <= 7 && daysRemaining >= 0;
  const isExpired = daysRemaining !== null && daysRemaining < 0;

  // Calculate visual progress percentage (Assume 30-day baseline or actual duration)
  const progressPercent = daysRemaining !== null
    ? Math.max(0, Math.min(100, Math.round((daysRemaining / 30) * 100)))
    : 0;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Welcome back, {profile?.name || 'Member'}! 👋
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          {gym?.name || 'IronForge Fitness Center'} Member Portal
        </p>
      </div>

      {/* Main Membership Highlight Card */}
      <div className="rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge variant={isExpired ? 'red' : isExpiring ? 'amber' : 'emerald'} size="md">
                {isExpired ? 'EXPIRED' : isExpiring ? 'EXPIRING SOON' : 'ACTIVE MEMBERSHIP'}
              </Badge>
              <span className="text-xs text-zinc-400 font-medium">
                Plan: <strong className="text-white">{membership?.planName || 'Standard Access'}</strong>
              </span>
            </div>

            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Valid Until</p>
              <p className="text-3xl sm:text-4xl font-black text-white mt-1">
                {membership ? formatReadableDate(membership.expiryDate) : 'Not assigned'}
              </p>
            </div>

            {/* Visual Progress Bar */}
            <div className="max-w-md space-y-1.5 pt-2">
              <div className="flex justify-between text-xs text-zinc-400">
                <span>Access Status</span>
                <span className={isExpired ? 'text-red-400 font-bold' : isExpiring ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {daysRemaining !== null
                    ? daysRemaining < 0
                      ? `Expired by ${Math.abs(daysRemaining)} days`
                      : daysRemaining === 0
                      ? 'Expires Today'
                      : `${daysRemaining} days remaining`
                    : 'N/A'}
                </span>
              </div>
              <div className="h-2.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    isExpired ? 'bg-red-500' : isExpiring ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${isExpired ? 100 : progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            <Link to="/member/membership">
              <Button variant="secondary" className="w-full text-xs" icon={<CreditCard className="w-4 h-4" />}>
                View Membership History
              </Button>
            </Link>
            <Link to="/member/problems">
              <Button variant="outline" className="w-full text-xs" icon={<AlertCircle className="w-4 h-4 text-blue-400" />}>
                Report Equipment Issue
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Grid of 2 Sections: Store & Recent Tickets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gym Store Preview */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-semibold text-white">Gym Store & Supplements</h3>
              </div>
              <Link to="/member/products" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                Browse <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <p className="text-xs text-zinc-400 mt-4 leading-relaxed">
              Explore supplements, hydration drinks, lifting straps, and official gym apparel available at the reception desk.
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-zinc-800">
            <Link to="/member/products">
              <Button variant="secondary" size="sm" className="w-full">
                View Available Products
              </Button>
            </Link>
          </div>
        </Card>

        {/* Maintenance / Problem Reports */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-semibold text-white">My Maintenance Tickets</h3>
              </div>
              <Link to="/member/problems" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                Report Issue <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="mt-4 divide-y divide-zinc-800/60">
              {complaints.length === 0 ? (
                <p className="text-xs text-zinc-500 py-6 text-center">
                  You have not reported any maintenance issues.
                </p>
              ) : (
                complaints.slice(0, 3).map((c) => (
                  <div key={c.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-white line-clamp-1">{c.title}</p>
                      <p className="text-[11px] text-zinc-500">{c.category}</p>
                    </div>
                    <Badge variant={c.status === 'RESOLVED' ? 'emerald' : 'amber'}>
                      {c.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-zinc-800">
            <Link to="/member/problems">
              <Button variant="outline" size="sm" className="w-full">
                Report a Facility Issue
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
