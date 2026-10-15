import React, { useState, useEffect } from 'react';
import { RefreshCw, Search, Calendar, CreditCard, ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getRenewals } from '@/services/renewalService';
import { getMembers } from '@/services/memberService';
import { formatReadableDate, formatReadableDateTime } from '@/utils/dateUtils';
import type { RenewalRecord, Member } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';

export const RenewalsPage: React.FC = () => {
  const { gym, profile } = useAuth();
  const [renewals, setRenewals] = useState<RenewalRecord[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const gymId = gym?.gymId || profile?.gymId || '';

  useEffect(() => {
    if (!gymId) return;
    const load = async () => {
      try {
        setLoading(true);
        const [rList, mList] = await Promise.all([
          getRenewals(gymId),
          getMembers(gymId),
        ]);
        setRenewals(rList);
        setMembers(mList);
      } catch (err) {
        console.error('Error fetching renewals:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [gymId]);

  const memberMap = new Map<string, Member>();
  members.forEach(m => memberMap.set(m.id, m));

  const filteredRenewals = renewals.filter(r => {
    const mem = memberMap.get(r.memberId);
    const name = mem ? mem.fullName.toLowerCase() : '';
    const plan = r.planName.toLowerCase();
    const term = searchTerm.toLowerCase();
    return name.includes(term) || plan.includes(term) || r.paymentMethod.toLowerCase().includes(term);
  });

  const totalRenewalRevenue = renewals
    .filter(r => r.paymentStatus === 'PAID')
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Renewal Transactions
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-normal">
              {filteredRenewals.length}
            </span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Historical audit log of all membership renewals and subscription extensions
          </p>
        </div>

        <div className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center gap-3">
          <span className="text-xs text-zinc-400">Total Renewal Revenue:</span>
          <span className="text-sm font-bold text-emerald-400">₹{totalRenewalRevenue.toLocaleString()}</span>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 max-w-md">
        <Input
          placeholder="Search member, plan, or payment..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search className="w-4 h-4" />}
        />
      </div>

      {/* Renewals Table */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900/90 text-zinc-400 uppercase text-[10px] font-semibold tracking-wider border-b border-zinc-800">
              <tr>
                <th className="py-3.5 px-4">Member</th>
                <th className="py-3.5 px-4">Renewed Plan</th>
                <th className="py-3.5 px-4">Period Extended</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    Loading renewal transactions...
                  </td>
                </tr>
              ) : filteredRenewals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    No renewal records found.
                  </td>
                </tr>
              ) : (
                filteredRenewals.map((r) => {
                  const mem = memberMap.get(r.memberId);
                  return (
                    <tr key={r.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-white">{mem ? mem.fullName : 'Member'}</p>
                        <p className="text-[11px] text-zinc-500">{mem ? mem.phone : r.memberId}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-medium text-zinc-200">{r.planName}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-zinc-300">
                          <span>{formatReadableDate(r.previousExpiryDate)}</span>
                          <ArrowRight className="w-3 h-3 text-zinc-500" />
                          <span className="text-emerald-400 font-semibold">{formatReadableDate(r.newExpiryDate)}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-white">₹{r.amount.toLocaleString()}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <Badge variant={r.paymentStatus === 'PAID' ? 'emerald' : 'amber'}>
                            {r.paymentStatus}
                          </Badge>
                          <span className="text-[10px] text-zinc-400">{r.paymentMethod}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-zinc-500 text-[11px]">
                        {formatReadableDateTime(r.createdAt)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
