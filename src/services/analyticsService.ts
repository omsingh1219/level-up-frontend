import {
  collection,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import { db, isFirebaseConfigured, runFirestoreOp } from '@/lib/firebase';
import type { Member, Membership, RenewalRecord, MembershipPlan } from '@/types';
import { subDays, parseISO, isAfter, isBefore, format, startOfMonth } from 'date-fns';

export type TimeRangeOption = '7d' | '30d' | '3m' | '6m' | '12m';

export interface AnalyticsSummary {
  totalMembers: number;
  activeMembers: number;
  expiringSoonMembers: number;
  expiredMembers: number;
  newMembersInRange: number;
  renewalsInRange: number;
  totalRevenueInRange: number;
  renewalRate: number; // percentage (0 - 100)
}

export interface GrowthDataPoint {
  date: string;
  newMembers: number;
  cumulativeMembers: number;
}

export interface RevenueDataPoint {
  period: string;
  revenue: number;
  renewalsCount: number;
}

export interface PlanDistributionDataPoint {
  name: string;
  count: number;
  revenue: number;
}

export interface FullAnalyticsData {
  summary: AnalyticsSummary;
  growthSeries: GrowthDataPoint[];
  revenueSeries: RevenueDataPoint[];
  planDistribution: PlanDistributionDataPoint[];
  activeVsExpired: { name: string; value: number; color: string }[];
}

export async function fetchGymAnalytics(
  gymId: string,
  timeRange: TimeRangeOption = '30d'
): Promise<FullAnalyticsData> {
  const daysMap: Record<TimeRangeOption, number> = {
    '7d': 7,
    '30d': 30,
    '3m': 90,
    '6m': 180,
    '12m': 365,
  };

  const daysToSubtract = daysMap[timeRange];
  const cutoffDate = subDays(new Date(), daysToSubtract);

  // Fetch all collections for the gym
  let members: Member[] = [];
  let memberships: Membership[] = [];
  let renewals: RenewalRecord[] = [];
  let plans: MembershipPlan[] = [];

  if (isFirebaseConfigured()) {
    try {
      const snapData = await runFirestoreOp(() =>
        Promise.all([
          getDocs(collection(db, 'gyms', gymId, 'members')),
          getDocs(collection(db, 'gyms', gymId, 'memberships')),
          getDocs(collection(db, 'gyms', gymId, 'renewals')),
          getDocs(collection(db, 'gyms', gymId, 'membershipPlans')),
        ])
      );
      if (snapData) {
        const [membersSnap, membershipsSnap, renewalsSnap, plansSnap] = snapData;
        members = membersSnap.docs.map(d => ({ id: d.id, ...d.data() } as Member));
        memberships = membershipsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Membership));
        renewals = renewalsSnap.docs.map(d => ({ id: d.id, ...d.data() } as RenewalRecord));
        plans = plansSnap.docs.map(d => ({ id: d.id, ...d.data() } as MembershipPlan));
      }
    } catch {
      // Fallback
    }
  }

  if (members.length === 0) {
    const { localStore } = await import('@/lib/localStore');
    members = localStore.getMembers(gymId);
    memberships = localStore.getMemberships(gymId);
    renewals = localStore.getRenewals(gymId);
    plans = localStore.getPlans(gymId);
  }

  // Compute Summary Metrics
  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.status === 'ACTIVE').length;
  const expiringSoonMembers = memberships.filter(m => m.status === 'EXPIRING_SOON').length;
  const expiredMembers = memberships.filter(m => m.status === 'EXPIRED').length;

  const newMembersInRange = members.filter(m => {
    try {
      const joinDate = parseISO(m.joinedAt || m.createdAt);
      return isAfter(joinDate, cutoffDate);
    } catch {
      return false;
    }
  }).length;

  const renewalsInRangeList = renewals.filter(r => {
    try {
      const renDate = parseISO(r.createdAt);
      return isAfter(renDate, cutoffDate);
    } catch {
      return false;
    }
  });

  const renewalsInRange = renewalsInRangeList.length;

  // Revenue in range = renewals amount + initial memberships started within range
  const membershipsInRange = memberships.filter(m => {
    try {
      const st = parseISO(m.startDate || m.createdAt);
      return isAfter(st, cutoffDate);
    } catch {
      return false;
    }
  });

  const revenueFromNewMemberships = membershipsInRange
    .filter(m => m.paymentStatus === 'PAID')
    .reduce((sum, m) => sum + (Number(m.amount) || 0), 0);

  const revenueFromRenewals = renewalsInRangeList
    .filter(r => r.paymentStatus === 'PAID')
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  const totalRevenueInRange = revenueFromNewMemberships + revenueFromRenewals;

  // Renewal rate: percentage of expired/expiring members that renewed
  const eligibleRenewalsCount = memberships.filter(m => m.status === 'EXPIRED' || m.status === 'EXPIRING_SOON' || renewals.length > 0).length;
  const renewalRate = eligibleRenewalsCount > 0
    ? Math.min(100, Math.round((renewals.length / (totalMembers || 1)) * 100))
    : 0;

  // Build Growth Series (grouped by day/week)
  const growthMap = new Map<string, number>();
  members.forEach(m => {
    const dStr = (m.joinedAt || m.createdAt || '').substring(0, 10);
    if (dStr) {
      growthMap.set(dStr, (growthMap.get(dStr) || 0) + 1);
    }
  });

  const sortedDates = Array.from(growthMap.keys()).sort();
  let cumulative = 0;
  const growthSeries: GrowthDataPoint[] = sortedDates.map(date => {
    cumulative += growthMap.get(date) || 0;
    return {
      date,
      newMembers: growthMap.get(date) || 0,
      cumulativeMembers: cumulative,
    };
  });

  // Build Revenue Series (Grouped by month or week)
  const revenueMap = new Map<string, { revenue: number; renewals: number }>();
  renewals.forEach(r => {
    const monthKey = (r.createdAt || '').substring(0, 7); // YYYY-MM
    if (monthKey) {
      const current = revenueMap.get(monthKey) || { revenue: 0, renewals: 0 };
      revenueMap.set(monthKey, {
        revenue: current.revenue + (r.paymentStatus === 'PAID' ? r.amount : 0),
        renewals: current.renewals + 1,
      });
    }
  });

  memberships.forEach(m => {
    const monthKey = (m.startDate || m.createdAt || '').substring(0, 7);
    if (monthKey) {
      const current = revenueMap.get(monthKey) || { revenue: 0, renewals: 0 };
      revenueMap.set(monthKey, {
        revenue: current.revenue + (m.paymentStatus === 'PAID' ? m.amount : 0),
        renewals: current.renewals,
      });
    }
  });

  const revenueSeries: RevenueDataPoint[] = Array.from(revenueMap.keys())
    .sort()
    .map(period => ({
      period,
      revenue: revenueMap.get(period)?.revenue || 0,
      renewalsCount: revenueMap.get(period)?.renewals || 0,
    }));

  // Build Plan Distribution
  const planCountMap = new Map<string, { count: number; revenue: number }>();
  memberships.forEach(m => {
    const name = m.planName || 'Standard';
    const curr = planCountMap.get(name) || { count: 0, revenue: 0 };
    planCountMap.set(name, {
      count: curr.count + 1,
      revenue: curr.revenue + (m.paymentStatus === 'PAID' ? m.amount : 0),
    });
  });

  const planDistribution: PlanDistributionDataPoint[] = Array.from(planCountMap.entries()).map(([name, val]) => ({
    name,
    count: val.count,
    revenue: val.revenue,
  }));

  // Active vs Expired
  const activeVsExpired = [
    { name: 'Active Members', value: activeMembers, color: '#10b981' },
    { name: 'Expiring Soon', value: expiringSoonMembers, color: '#f59e0b' },
    { name: 'Expired', value: expiredMembers, color: '#ef4444' },
  ];

  return {
    summary: {
      totalMembers,
      activeMembers,
      expiringSoonMembers,
      expiredMembers,
      newMembersInRange,
      renewalsInRange,
      totalRevenueInRange,
      renewalRate,
    },
    growthSeries,
    revenueSeries,
    planDistribution,
    activeVsExpired,
  };
}
