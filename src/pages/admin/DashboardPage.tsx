import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  Clock,
  AlertTriangle,
  UserPlus,
  RefreshCw,
  TrendingUp,
  Percent,
  Plus,
  Calendar,
  AlertCircle,
  Activity,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Play
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getMembers } from '@/services/memberService';
import { getAllMemberships } from '@/services/membershipService';
import { getRenewals } from '@/services/renewalService';
import { getComplaints } from '@/services/complaintService';
import { getAuditLogs } from '@/services/auditService';
import { runExpiryAutomationForGym, type ExpiryAutomationRunResult } from '@/services/expiryAutomationService';
import { formatReadableDate, calculateDaysRemaining } from '@/utils/dateUtils';
import type { Member, Membership, RenewalRecord, Complaint, AuditLog } from '@/types';
import { parseISO, isAfter, startOfMonth } from 'date-fns';

export const DashboardPage: React.FC = () => {
  const { gym, profile } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<Member[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [renewals, setRenewals] = useState<RenewalRecord[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [runningSweep, setRunningSweep] = useState(false);
  const [sweepResult, setSweepResult] = useState<ExpiryAutomationRunResult | null>(null);

  const gymId = gym?.gymId || profile?.gymId || '';

  const loadDashboardData = async () => {
    if (!gymId) return;
    try {
      setLoading(true);
      const [mList, msList, rList, cList, aList] = await Promise.all([
        getMembers(gymId),
        getAllMemberships(gymId),
        getRenewals(gymId),
        getComplaints(gymId),
        getAuditLogs(gymId, 8),
      ]);
      setMembers(mList);
      setMemberships(msList);
      setRenewals(rList);
      setComplaints(cList);
      setAuditLogs(aList);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [gymId]);

  // Compute live calculations from actual records
  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.status === 'ACTIVE').length;
  const expiringSoon = memberships.filter(m => m.status === 'EXPIRING_SOON').length;
  const expired = memberships.filter(m => m.status === 'EXPIRED').length;

  const monthStart = startOfMonth(new Date());
  const newMembersThisMonth = members.filter(m => {
    try {
      return isAfter(parseISO(m.joinedAt || m.createdAt), monthStart);
    } catch {
      return false;
    }
  }).length;

  const renewalsThisMonthList = renewals.filter(r => {
    try {
      return isAfter(parseISO(r.createdAt), monthStart);
    } catch {
      return false;
    }
  });
  const renewalsThisMonth = renewalsThisMonthList.length;

  // Monthly revenue calculation = new membership amounts + renewal payments this month
  const monthlyRevenue =
    memberships
      .filter(m => {
        try {
          return isAfter(parseISO(m.startDate || m.createdAt), monthStart) && m.paymentStatus === 'PAID';
        } catch {
          return false;
        }
      })
      .reduce((sum, m) => sum + (Number(m.amount) || 0), 0) +
    renewalsThisMonthList
      .filter(r => r.paymentStatus === 'PAID')
      .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  const eligibleForRenewal = totalMembers > 0 ? totalMembers : 1;
  const renewalRate = Math.min(100, Math.round((renewals.length / eligibleForRenewal) * 100));

  // Expiring memberships list
  const expiringList = memberships
    .filter(m => m.status === 'EXPIRING_SOON' || (m.status === 'ACTIVE' && calculateDaysRemaining(m.expiryDate) <= 7 && calculateDaysRemaining(m.expiryDate) >= 0))
    .slice(0, 5);

  // Recently expired
  const recentlyExpiredList = memberships
    .filter(m => m.status === 'EXPIRED')
    .slice(0, 5);

  // Recent complaints
  const openComplaints = complaints
    .filter(c => c.status === 'OPEN' || c.status === 'IN_PROGRESS')
    .slice(0, 5);

  const handleRunExpirySweep = async () => {
    if (!gymId) return;
    try {
      setRunningSweep(true);
      const res = await runExpiryAutomationForGym(gymId);
      setSweepResult(res);
      await loadDashboardData();
    } catch (e: any) {
      console.error('Sweep error:', e);
    } finally {
      setRunningSweep(false);
    }
  };

  const getMemberName = (memberId: string) => {
    const mem = members.find(m => m.id === memberId);
    return mem ? mem.fullName : 'Member';
  };

  return (
    <div className="space-y-8">
      {/* Welcome & Quick Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Real-time status for <span className="text-emerald-400 font-semibold">{gym?.name || 'Your Gym'}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleRunExpirySweep}
            isLoading={runningSweep}
            icon={<Play className="w-3.5 h-3.5 text-amber-400" />}
          >
            Run Expiry Check
          </Button>
          <Link to="/admin/members">
            <Button size="sm" variant="primary" icon={<UserPlus className="w-4 h-4" />}>
              Add Member
            </Button>
          </Link>
          <Link to="/admin/plans">
            <Button size="sm" variant="outline" icon={<Plus className="w-4 h-4" />}>
              Add Plan
            </Button>
          </Link>
        </div>
      </div>

      {/* Sweep Result Banner */}
      {sweepResult && (
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs text-amber-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Automation Run Complete: Scanned <strong>{sweepResult.scannedCount}</strong> memberships. Dispatched <strong>{sweepResult.remindersSent}</strong> reminders. Skipped <strong>{sweepResult.duplicateSkipped}</strong> duplicates.
            </span>
          </div>
          <button
            onClick={() => setSweepResult(null)}
            className="text-amber-400 hover:text-white text-xs font-semibold ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 8 Primary Calculated Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Members */}
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400 font-medium">Total Members</p>
            <p className="text-2xl font-bold text-white mt-1">{totalMembers}</p>
            <span className="text-[10px] text-zinc-500 mt-1 block">Registered in gym</span>
          </div>
          <div className="p-3 rounded-xl bg-zinc-800/80 text-zinc-300">
            <Users className="w-5 h-5" />
          </div>
        </Card>

        {/* Active Members */}
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400 font-medium">Active Members</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{activeMembers}</p>
            <span className="text-[10px] text-emerald-500/80 mt-1 block">With valid status</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <UserCheck className="w-5 h-5" />
          </div>
        </Card>

        {/* Expiring Soon */}
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400 font-medium">Expiring Soon</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">{expiringSoon}</p>
            <span className="text-[10px] text-amber-500/80 mt-1 block">&le; 7 days remaining</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-5 h-5" />
          </div>
        </Card>

        {/* Expired */}
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400 font-medium">Expired</p>
            <p className="text-2xl font-bold text-red-400 mt-1">{expired}</p>
            <span className="text-[10px] text-red-500/80 mt-1 block">Needs renewal</span>
          </div>
          <div className="p-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </Card>

        {/* New Members This Month */}
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400 font-medium">New This Month</p>
            <p className="text-2xl font-bold text-white mt-1">+{newMembersThisMonth}</p>
            <span className="text-[10px] text-zinc-500 mt-1 block">Joined current month</span>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <UserPlus className="w-5 h-5" />
          </div>
        </Card>

        {/* Renewals This Month */}
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400 font-medium">Renewals This Month</p>
            <p className="text-2xl font-bold text-white mt-1">{renewalsThisMonth}</p>
            <span className="text-[10px] text-zinc-500 mt-1 block">Processed cycles</span>
          </div>
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <RefreshCw className="w-5 h-5" />
          </div>
        </Card>

        {/* Monthly Revenue */}
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400 font-medium">Monthly Revenue</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">₹{monthlyRevenue.toLocaleString()}</p>
            <span className="text-[10px] text-emerald-500/80 mt-1 block">Paid memberships</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
        </Card>

        {/* Renewal Rate */}
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400 font-medium">Renewal Rate</p>
            <p className="text-2xl font-bold text-white mt-1">{renewalRate}%</p>
            <span className="text-[10px] text-zinc-500 mt-1 block">Member retention</span>
          </div>
          <div className="p-3 rounded-xl bg-zinc-800 text-zinc-300">
            <Percent className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Main Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section B: Expiring Memberships */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-semibold text-white">Expiring Memberships</h2>
            </div>
            <Link to="/admin/members" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="mt-4 flex-1 divide-y divide-zinc-800/60">
            {expiringList.length === 0 ? (
              <p className="text-xs text-zinc-500 py-8 text-center">No memberships are expiring soon.</p>
            ) : (
              expiringList.map(item => {
                const days = calculateDaysRemaining(item.expiryDate);
                return (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-white">{getMemberName(item.memberId)}</p>
                      <p className="text-[11px] text-zinc-400">{item.planName} • Exp: {formatReadableDate(item.expiryDate)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={days <= 1 ? 'red' : 'amber'}>
                        {days === 0 ? 'Today' : `${days}d remaining`}
                      </Badge>
                      <button
                        onClick={() => navigate(`/admin/members/${item.memberId}`)}
                        className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[11px] text-zinc-200 transition-colors cursor-pointer"
                      >
                        Renew
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Section C: Recently Expired */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <h2 className="text-sm font-semibold text-white">Recently Expired</h2>
            </div>
            <Link to="/admin/members" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="mt-4 flex-1 divide-y divide-zinc-800/60">
            {recentlyExpiredList.length === 0 ? (
              <p className="text-xs text-zinc-500 py-8 text-center">No memberships have expired.</p>
            ) : (
              recentlyExpiredList.map(item => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-white">{getMemberName(item.memberId)}</p>
                    <p className="text-[11px] text-zinc-400">{item.planName} • Expired {formatReadableDate(item.expiryDate)}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/admin/members/${item.memberId}`)}
                    className="px-2.5 py-1 rounded bg-emerald-600/20 border border-emerald-500/30 hover:bg-emerald-600/30 text-[11px] font-medium text-emerald-400 transition-colors cursor-pointer"
                  >
                    Reactivate
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Section D: Recent Complaints */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-semibold text-white">Maintenance & Complaints</h2>
            </div>
            <Link to="/admin/problems" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
              Manage <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="mt-4 flex-1 divide-y divide-zinc-800/60">
            {openComplaints.length === 0 ? (
              <p className="text-xs text-zinc-500 py-8 text-center">No active complaints or repair tickets.</p>
            ) : (
              openComplaints.map(comp => (
                <div key={comp.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-white line-clamp-1">{comp.title}</p>
                    <p className="text-[11px] text-zinc-400">{comp.category} • By {comp.memberName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={comp.priority === 'CRITICAL' || comp.priority === 'HIGH' ? 'red' : 'amber'}>
                      {comp.priority}
                    </Badge>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                      {comp.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Section E: Recent Activity / Audit Log */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-semibold text-white">Recent Activity Log</h2>
            </div>
            <Link to="/admin/audit" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
              Full Log <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="mt-4 flex-1 divide-y divide-zinc-800/60">
            {auditLogs.length === 0 ? (
              <p className="text-xs text-zinc-500 py-8 text-center">No audit activity logged yet.</p>
            ) : (
              auditLogs.map(log => (
                <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-medium text-zinc-200">{log.action.replace('_', ' ')}</p>
                    <p className="text-[11px] text-zinc-500">By {log.actorName} ({log.actorRole})</p>
                  </div>
                  <span className="text-[10px] text-zinc-500">{formatReadableDate(log.timestamp)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
