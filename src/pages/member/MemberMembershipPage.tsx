import React, { useState, useEffect } from 'react';
import { CreditCard, Calendar, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Badge, Card } from '@/components/ui/Badge';
import { getMemberMemberships } from '@/services/membershipService';
import { getRenewals } from '@/services/renewalService';
import { formatReadableDate, calculateDaysRemaining } from '@/utils/dateUtils';
import type { Membership, RenewalRecord } from '@/types';

export const MemberMembershipPage: React.FC = () => {
  const { profile, gym } = useAuth();
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [renewals, setRenewals] = useState<RenewalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const gymId = gym?.gymId || profile?.gymId || '';
  const memberId = profile?.uid || 'member-demo-rahul';

  useEffect(() => {
    if (!gymId) return;
    const load = async () => {
      try {
        setLoading(true);
        let msList = await getMemberMemberships(gymId, memberId);
        if (msList.length === 0) {
          msList = await getMemberMemberships(gymId, 'member-1');
        }
        const rList = await getRenewals(gymId, memberId);
        setMemberships(msList);
        setRenewals(rList);
      } catch (e) {
        console.error('Error fetching member memberships:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [gymId, memberId]);

  const activeMs = memberships[0] || null;
  const days = activeMs ? calculateDaysRemaining(activeMs.expiryDate) : null;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          My Membership & Invoices
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Detailed overview of your current access plan and historical renewals
        </p>
      </div>

      {/* Active Membership Details */}
      {activeMs ? (
        <Card className="space-y-4 border-emerald-500/30 bg-zinc-900/80">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Current Pass</span>
              <h2 className="text-xl font-extrabold text-white mt-0.5">{activeMs.planName}</h2>
            </div>
            <Badge variant={days !== null && days < 0 ? 'red' : 'emerald'} size="md">
              {days !== null && days < 0 ? 'Expired' : 'Active'}
            </Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <p className="text-zinc-400">Start Date</p>
              <p className="font-semibold text-white mt-1">{formatReadableDate(activeMs.startDate)}</p>
            </div>
            <div>
              <p className="text-zinc-400">Expiry Date</p>
              <p className="font-semibold text-white mt-1">{formatReadableDate(activeMs.expiryDate)}</p>
            </div>
            <div>
              <p className="text-zinc-400">Days Remaining</p>
              <p className="font-semibold text-emerald-400 mt-1">
                {days !== null ? (days < 0 ? 'Expired' : `${days} days`) : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-zinc-400">Payment Status</p>
              <p className="font-semibold text-zinc-200 mt-1">{activeMs.paymentStatus} ({activeMs.paymentMethod})</p>
            </div>
          </div>
        </Card>
      ) : (
        <p className="text-xs text-zinc-500 py-6 text-center">No active membership assigned yet.</p>
      )}

      {/* History */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-white">Membership History Log</h3>
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/90 text-zinc-400 uppercase text-[10px] font-semibold border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Plan Name</th>
                  <th className="py-3 px-4">Duration Range</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {memberships.length === 0 ? (
                  <tr><td colSpan={4} className="py-8 text-center text-zinc-500">No history found.</td></tr>
                ) : (
                  memberships.map((m) => (
                    <tr key={m.id} className="hover:bg-zinc-800/20">
                      <td className="py-3 px-4 font-semibold text-white">{m.planName}</td>
                      <td className="py-3 px-4 text-zinc-300">
                        {formatReadableDate(m.startDate)} → {formatReadableDate(m.expiryDate)}
                      </td>
                      <td className="py-3 px-4 font-bold text-white">₹{m.amount}</td>
                      <td className="py-3 px-4"><Badge variant="zinc">{m.status}</Badge></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};
