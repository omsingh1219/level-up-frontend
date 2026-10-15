import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Bell,
  MessageSquare,
  ShieldCheck,
  Send,
  Plus
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge, Card } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { getMember, updateMember, archiveMember } from '@/services/memberService';
import { getMemberMemberships, assignMembership, getMembership } from '@/services/membershipService';
import { getRenewals, renewMembership } from '@/services/renewalService';
import { getPlans } from '@/services/planService';
import { getComplaints } from '@/services/complaintService';
import { getNotifications, createNotification } from '@/services/notificationService';
import { sendWhatsAppExpiryReminder } from '@/services/whatsappService';
import { formatReadableDate, calculateDaysRemaining } from '@/utils/dateUtils';
import type { Member, Membership, RenewalRecord, MembershipPlan, Complaint, AppNotification } from '@/types';

export const MemberDetailPage: React.FC = () => {
  const { id: memberId } = useParams<{ id: string }>();
  const { gym, profile, hasPermission } = useAuth();
  const navigate = useNavigate();

  const [member, setMember] = useState<Member | null>(null);
  const [currentMembership, setCurrentMembership] = useState<Membership | null>(null);
  const [membershipHistory, setMembershipHistory] = useState<Membership[]>([]);
  const [renewals, setRenewals] = useState<RenewalRecord[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'HISTORY' | 'RENEWALS' | 'COMPLAINTS' | 'NOTIFICATIONS'>('OVERVIEW');

  // Assign Membership Modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignPlanId, setAssignPlanId] = useState('');
  const [assignStartDate, setAssignStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [assignPaymentStatus, setAssignPaymentStatus] = useState<'PAID' | 'PENDING'>('PAID');
  const [assignPaymentMethod, setAssignPaymentMethod] = useState<'UPI' | 'CASH' | 'CARD'>('UPI');
  const [submittingAssign, setSubmittingAssign] = useState(false);

  // Renew Membership Modal
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [renewPlanId, setRenewPlanId] = useState('');
  const [renewStartDate, setRenewStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [renewAmount, setRenewAmount] = useState<number>(0);
  const [renewNotes, setRenewNotes] = useState('');
  const [submittingRenew, setSubmittingRenew] = useState(false);

  // Reminder trigger state
  const [sendingReminder, setSendingReminder] = useState(false);
  const [reminderStatus, setReminderStatus] = useState<string | null>(null);

  const gymId = gym?.gymId || profile?.gymId || '';

  const loadAllMemberData = async () => {
    if (!gymId || !memberId) return;
    try {
      setLoading(true);
      const [m, msList, rList, pList, cList, nList] = await Promise.all([
        getMember(gymId, memberId),
        getMemberMemberships(gymId, memberId),
        getRenewals(gymId, memberId),
        getPlans(gymId, true),
        getComplaints(gymId, memberId),
        getNotifications(gymId, undefined, 20),
      ]);

      setMember(m);
      setMembershipHistory(msList);
      setRenewals(rList);
      setPlans(pList);
      setComplaints(cList);
      setNotifications(nList.filter(n => n.memberId === memberId));

      if (msList.length > 0) {
        setCurrentMembership(msList[0]);
        setRenewPlanId(msList[0].planId);
        setRenewAmount(msList[0].amount);
      } else if (pList.length > 0) {
        setAssignPlanId(pList[0].id);
      }
    } catch (err) {
      console.error('Failed to load member detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllMemberData();
  }, [gymId, memberId]);

  if (loading) {
    return (
      <div className="py-20 text-center text-zinc-400 text-sm">
        Loading member record...
      </div>
    );
  }

  if (!member) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-lg font-bold text-white mb-2">Member Not Found</h2>
        <p className="text-xs text-zinc-400 mb-6">The requested member record could not be loaded.</p>
        <Link to="/admin/members">
          <Button variant="secondary" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
            Back to Directory
          </Button>
        </Link>
      </div>
    );
  }

  const daysRemaining = currentMembership ? calculateDaysRemaining(currentMembership.expiryDate) : null;
  const isExpiring = daysRemaining !== null && daysRemaining <= 7 && daysRemaining >= 0;
  const isExpired = daysRemaining !== null && daysRemaining < 0;

  // Handle Assign Membership
  const handleAssignMembership = async (e: React.FormEvent) => {
    e.preventDefault();
    const plan = plans.find(p => p.id === assignPlanId);
    if (!plan || !gymId || !memberId) return;

    try {
      setSubmittingAssign(true);
      const actor = {
        uid: profile?.uid || 'admin',
        name: profile?.name || 'Admin',
        role: profile?.role || 'ADMIN',
      };

      await assignMembership(
        gymId,
        {
          memberId,
          planId: plan.id,
          planName: plan.name,
          durationInDays: plan.durationInDays,
          startDate: assignStartDate,
          amount: plan.price,
          paymentStatus: assignPaymentStatus,
          paymentMethod: assignPaymentMethod,
        },
        actor
      );

      setIsAssignModalOpen(false);
      await loadAllMemberData();
    } catch (err) {
      console.error('Assign error:', err);
    } finally {
      setSubmittingAssign(false);
    }
  };

  // Handle Renew Membership
  const handleRenewMembership = async (e: React.FormEvent) => {
    e.preventDefault();
    const plan = plans.find(p => p.id === renewPlanId);
    if (!plan || !gymId || !memberId || !currentMembership) return;

    try {
      setSubmittingRenew(true);
      const actor = {
        uid: profile?.uid || 'admin',
        name: profile?.name || 'Admin',
        role: profile?.role || 'ADMIN',
      };

      await renewMembership(
        gymId,
        {
          membershipId: currentMembership.id,
          memberId,
          planId: plan.id,
          planName: plan.name,
          durationInDays: plan.durationInDays,
          newStartDate: renewStartDate,
          previousExpiryDate: currentMembership.expiryDate,
          amount: renewAmount || plan.price,
          paymentStatus: 'PAID',
          paymentMethod: 'UPI',
          notes: renewNotes,
        },
        actor
      );

      setIsRenewModalOpen(false);
      await loadAllMemberData();
    } catch (err) {
      console.error('Renewal error:', err);
    } finally {
      setSubmittingRenew(false);
    }
  };

  // Send Manual Reminder
  const handleSendReminder = async () => {
    if (!gymId || !member || !currentMembership) return;
    try {
      setSendingReminder(true);
      setReminderStatus(null);

      // Create in-app reminder
      await createNotification(gymId, {
        gymId,
        memberId: member.id,
        recipientUserId: member.userId,
        type: 'MEMBERSHIP_EXPIRING',
        channel: 'IN_APP',
        title: 'Membership Renewal Reminder',
        body: `Hi ${member.fullName}, your ${currentMembership.planName} membership expires on ${currentMembership.expiryDate}. Contact gym reception to renew.`,
        status: 'SENT',
      });

      // Try WhatsApp if configured
      const waResult = await sendWhatsAppExpiryReminder(gymId, member.phone, {
        memberName: member.fullName,
        gymName: gym?.name || 'GymOS',
        daysRemaining: Math.max(0, daysRemaining || 0),
        expiryDate: currentMembership.expiryDate,
      });

      if (waResult.unconfigured) {
        setReminderStatus('In-App notification sent. (Note: WhatsApp is unconfigured in Settings).');
      } else if (waResult.success) {
        setReminderStatus('Reminder successfully sent via In-App and WhatsApp!');
      } else {
        setReminderStatus(`In-App sent. WhatsApp error: ${waResult.error}`);
      }

      await loadAllMemberData();
    } catch (e: any) {
      setReminderStatus(`Failed: ${e.message}`);
    } finally {
      setSendingReminder(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/members"
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-3">
              {member.fullName}
              <Badge variant={member.status === 'ACTIVE' ? 'emerald' : 'zinc'}>
                {member.status}
              </Badge>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Member ID: <span className="font-mono text-zinc-300">{member.id}</span> • Joined {formatReadableDate(member.joinedAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentMembership ? (
            <Button
              size="sm"
              onClick={() => setIsRenewModalOpen(true)}
              icon={<RefreshCw className="w-4 h-4" />}
            >
              Renew Membership
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => setIsAssignModalOpen(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              Assign Membership
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={handleSendReminder}
            isLoading={sendingReminder}
            icon={<Send className="w-4 h-4 text-emerald-400" />}
          >
            Send Reminder
          </Button>
        </div>
      </div>

      {reminderStatus && (
        <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-300 flex items-center justify-between">
          <span>{reminderStatus}</span>
          <button onClick={() => setReminderStatus(null)} className="text-emerald-400 font-bold ml-2">×</button>
        </div>
      )}

      {/* Main Highlights Card: Current Membership */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 backdrop-blur-xl">
        <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">
          Current Membership Status
        </h2>

        {currentMembership ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-xs text-zinc-400">Assigned Plan</p>
              <p className="text-lg font-bold text-white mt-1">{currentMembership.planName}</p>
              <span className="text-[11px] text-zinc-500">₹{currentMembership.amount} ({currentMembership.paymentMethod})</span>
            </div>

            <div>
              <p className="text-xs text-zinc-400">Expiry Date</p>
              <p className={`text-lg font-bold mt-1 ${isExpired ? 'text-red-400' : isExpiring ? 'text-amber-400' : 'text-white'}`}>
                {formatReadableDate(currentMembership.expiryDate)}
              </p>
              <span className="text-[11px] text-zinc-500">Start: {formatReadableDate(currentMembership.startDate)}</span>
            </div>

            <div>
              <p className="text-xs text-zinc-400">Days Remaining</p>
              <p className={`text-lg font-bold mt-1 ${isExpired ? 'text-red-400' : isExpiring ? 'text-amber-400' : 'text-emerald-400'}`}>
                {daysRemaining !== null ? (
                  daysRemaining < 0 ? `Expired (${Math.abs(daysRemaining)}d ago)` : `${daysRemaining} days`
                ) : 'N/A'}
              </p>
              <span className="text-[11px] text-zinc-500">Source: Firestore schedule</span>
            </div>

            <div>
              <p className="text-xs text-zinc-400">Payment Status</p>
              <div className="mt-1.5">
                <Badge variant={currentMembership.paymentStatus === 'PAID' ? 'emerald' : 'amber'}>
                  {currentMembership.paymentStatus}
                </Badge>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center">
            <p className="text-xs text-zinc-400 mb-3">This member currently has no active membership plan assigned.</p>
            <Button size="sm" onClick={() => setIsAssignModalOpen(true)}>
              Assign Membership Plan
            </Button>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-zinc-800 flex gap-6 text-xs font-medium">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`pb-3 transition-colors cursor-pointer ${
            activeTab === 'OVERVIEW'
              ? 'text-emerald-400 border-b-2 border-emerald-400 font-bold'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Overview & Contact
        </button>
        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`pb-3 transition-colors cursor-pointer ${
            activeTab === 'HISTORY'
              ? 'text-emerald-400 border-b-2 border-emerald-400 font-bold'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Membership History ({membershipHistory.length})
        </button>
        <button
          onClick={() => setActiveTab('RENEWALS')}
          className={`pb-3 transition-colors cursor-pointer ${
            activeTab === 'RENEWALS'
              ? 'text-emerald-400 border-b-2 border-emerald-400 font-bold'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Renewals Log ({renewals.length})
        </button>
        <button
          onClick={() => setActiveTab('COMPLAINTS')}
          className={`pb-3 transition-colors cursor-pointer ${
            activeTab === 'COMPLAINTS'
              ? 'text-emerald-400 border-b-2 border-emerald-400 font-bold'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Complaints ({complaints.length})
        </button>
        <button
          onClick={() => setActiveTab('NOTIFICATIONS')}
          className={`pb-3 transition-colors cursor-pointer ${
            activeTab === 'NOTIFICATIONS'
              ? 'text-emerald-400 border-b-2 border-emerald-400 font-bold'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Notifications ({notifications.length})
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Contact & Demographics</h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2 text-zinc-300">
                <Phone className="w-4 h-4 text-zinc-500" />
                <span>{member.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <Mail className="w-4 h-4 text-zinc-500" />
                <span>{member.email}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <User className="w-4 h-4 text-zinc-500" />
                <span>Gender: {member.gender || 'Not specified'}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <Calendar className="w-4 h-4 text-zinc-500" />
                <span>DOB: {member.dateOfBirth || 'Not specified'}</span>
              </div>
            </div>
          </Card>

          <Card className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Emergency Contact & Preferences</h3>
            <div className="space-y-2.5 text-xs">
              <p className="text-zinc-300">
                <strong className="text-zinc-400">Emergency Name:</strong>{' '}
                {member.emergencyContact?.name || 'Not provided'}
              </p>
              <p className="text-zinc-300">
                <strong className="text-zinc-400">Emergency Phone:</strong>{' '}
                {member.emergencyContact?.phone || 'Not provided'}
              </p>
              <p className="text-zinc-300">
                <strong className="text-zinc-400">Relation:</strong>{' '}
                {member.emergencyContact?.relation || 'Family'}
              </p>
              <div className="pt-2 border-t border-zinc-800 flex items-center gap-4 text-zinc-400">
                <span>WhatsApp Opt-in: {member.communicationPreferences?.whatsappOptIn ? 'Yes' : 'No'}</span>
                <span>Email Opt-in: {member.communicationPreferences?.emailOptIn ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 2: Membership History */}
      {activeTab === 'HISTORY' && (
        <Card>
          <div className="divide-y divide-zinc-800">
            {membershipHistory.length === 0 ? (
              <p className="text-xs text-zinc-500 py-6 text-center">No membership history available.</p>
            ) : (
              membershipHistory.map((m) => (
                <div key={m.id} className="py-3.5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">{m.planName}</p>
                    <p className="text-[11px] text-zinc-400">
                      {formatReadableDate(m.startDate)} → {formatReadableDate(m.expiryDate)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-zinc-200">₹{m.amount}</span>
                    <Badge variant={m.status === 'ACTIVE' ? 'emerald' : m.status === 'EXPIRED' ? 'red' : 'amber'}>
                      {m.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* Tab 3: Renewals Log */}
      {activeTab === 'RENEWALS' && (
        <Card>
          <div className="divide-y divide-zinc-800">
            {renewals.length === 0 ? (
              <p className="text-xs text-zinc-500 py-6 text-center">No renewals recorded for this member yet.</p>
            ) : (
              renewals.map((r) => (
                <div key={r.id} className="py-3.5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">{r.planName}</p>
                    <p className="text-[11px] text-zinc-400">
                      Extended from {formatReadableDate(r.previousExpiryDate)} to {formatReadableDate(r.newExpiryDate)}
                    </p>
                    {r.notes && <p className="text-[10px] text-zinc-500 italic mt-0.5">Notes: {r.notes}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-emerald-400">₹{r.amount}</p>
                    <span className="text-[10px] text-zinc-500">{formatReadableDate(r.createdAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* Tab 4: Complaints */}
      {activeTab === 'COMPLAINTS' && (
        <Card>
          <div className="divide-y divide-zinc-800">
            {complaints.length === 0 ? (
              <p className="text-xs text-zinc-500 py-6 text-center">No problem tickets submitted by this member.</p>
            ) : (
              complaints.map((c) => (
                <div key={c.id} className="py-3.5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">{c.title}</p>
                    <p className="text-[11px] text-zinc-400">{c.category} • {formatReadableDate(c.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={c.priority === 'HIGH' || c.priority === 'CRITICAL' ? 'red' : 'zinc'}>
                      {c.priority}
                    </Badge>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                      {c.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* Tab 5: Notifications */}
      {activeTab === 'NOTIFICATIONS' && (
        <Card>
          <div className="divide-y divide-zinc-800">
            {notifications.length === 0 ? (
              <p className="text-xs text-zinc-500 py-6 text-center">No notifications recorded.</p>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="py-3 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-zinc-800 text-emerald-400 shrink-0">
                    <Bell className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{n.title}</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">{n.body}</p>
                    <span className="text-[10px] text-zinc-500">{formatReadableDate(n.createdAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* Assign Membership Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title={`Assign Membership: ${member.fullName}`}
        description="Choose a membership plan and start date. The system automatically computes the expiry date."
      >
        <form onSubmit={handleAssignMembership} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">Choose Plan</label>
            <select
              value={assignPlanId}
              onChange={(e) => setAssignPlanId(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 text-xs text-zinc-200 p-2.5 focus:border-emerald-500 focus:outline-none"
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.durationInDays} days) — ₹{p.price}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Start Date"
            type="date"
            required
            value={assignStartDate}
            onChange={(e) => setAssignStartDate(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Payment Method</label>
              <select
                value={assignPaymentMethod}
                onChange={(e) => setAssignPaymentMethod(e.target.value as any)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 text-xs text-zinc-200 p-2 focus:border-emerald-500 focus:outline-none"
              >
                <option value="UPI">UPI</option>
                <option value="CASH">Cash</option>
                <option value="CARD">Card</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Payment Status</label>
              <select
                value={assignPaymentStatus}
                onChange={(e) => setAssignPaymentStatus(e.target.value as any)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 text-xs text-zinc-200 p-2 focus:border-emerald-500 focus:outline-none"
              >
                <option value="PAID">Paid</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <Button type="button" variant="ghost" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submittingAssign}>
              Confirm Membership
            </Button>
          </div>
        </form>
      </Modal>

      {/* Renew Membership Modal */}
      <Modal
        isOpen={isRenewModalOpen}
        onClose={() => setIsRenewModalOpen(false)}
        title={`Renew Membership: ${member.fullName}`}
        description="Extend this membership. Previous expiry date will be updated and an immutable audit log created."
      >
        <form onSubmit={handleRenewMembership} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">Renewal Plan</label>
            <select
              value={renewPlanId}
              onChange={(e) => {
                setRenewPlanId(e.target.value);
                const pl = plans.find(p => p.id === e.target.value);
                if (pl) setRenewAmount(pl.price);
              }}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 text-xs text-zinc-200 p-2.5 focus:border-emerald-500 focus:outline-none"
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.durationInDays} days) — ₹{p.price}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Renewal Start Date"
            type="date"
            required
            value={renewStartDate}
            onChange={(e) => setRenewStartDate(e.target.value)}
          />

          <Input
            label="Amount (₹)"
            type="number"
            required
            value={renewAmount}
            onChange={(e) => setRenewAmount(Number(e.target.value))}
          />

          <Input
            label="Staff Notes (Optional)"
            placeholder="Special discount or renewal remarks"
            value={renewNotes}
            onChange={(e) => setRenewNotes(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <Button type="button" variant="ghost" onClick={() => setIsRenewModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submittingRenew}>
              Process Renewal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
