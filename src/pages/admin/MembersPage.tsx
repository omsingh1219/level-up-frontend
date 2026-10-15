import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  ArrowUpDown,
  MoreVertical,
  CheckCircle,
  Clock,
  Eye,
  Archive,
  Phone,
  Mail,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge, Card } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { getMembers, createMember, archiveMember } from '@/services/memberService';
import { getAllMemberships } from '@/services/membershipService';
import { formatReadableDate } from '@/utils/dateUtils';
import type { Member, MemberStatus, Membership } from '@/types';

export const MembersPage: React.FC = () => {
  const { gym, profile, hasPermission } = useAuth();
  const navigate = useNavigate();

  const [members, setMembers] = useState<Member[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | MemberStatus | 'EXPIRING'>('ALL');
  const [sortBy, setSortBy] = useState<'JOINED_DESC' | 'NAME_ASC'>('JOINED_DESC');

  // Add Member Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    gender: 'PREFER_NOT_TO_SAY' as Member['gender'],
    dateOfBirth: '1996-01-01',
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelation: 'Family',
    whatsappOptIn: true,
    emailOptIn: true,
  });

  const gymId = gym?.gymId || profile?.gymId || '';

  const loadData = async () => {
    if (!gymId) return;
    try {
      setLoading(true);
      const [mList, msList] = await Promise.all([
        getMembers(gymId),
        getAllMemberships(gymId),
      ]);
      setMembers(mList);
      setMemberships(msList);
    } catch (err) {
      console.error('Error fetching members list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [gymId]);

  // Map memberships for quick lookup
  const membershipMap = new Map<string, Membership>();
  memberships.forEach(ms => {
    membershipMap.set(ms.memberId, ms);
  });

  // Filter & Sort
  const filteredMembers = members.filter(m => {
    const matchesSearch =
      m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.phone.includes(searchTerm) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'EXPIRING') {
      const ms = membershipMap.get(m.id);
      return ms?.status === 'EXPIRING_SOON';
    }
    return m.status === statusFilter;
  }).sort((a, b) => {
    if (sortBy === 'NAME_ASC') {
      return a.fullName.localeCompare(b.fullName);
    }
    return (b.joinedAt || '').localeCompare(a.joinedAt || '');
  });

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.email) {
      setFormError('Name, phone, and email are required.');
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);
      const actor = {
        uid: profile?.uid || 'admin',
        name: profile?.name || 'Administrator',
        role: profile?.role || 'ADMIN',
      };

      await createMember(
        gymId,
        {
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          gender: formData.gender,
          dateOfBirth: formData.dateOfBirth,
          joinedAt: new Date().toISOString().split('T')[0],
          status: 'ACTIVE',
          communicationPreferences: {
            whatsappOptIn: formData.whatsappOptIn,
            emailOptIn: formData.emailOptIn,
            notificationOptIn: true,
          },
          emergencyContact: {
            name: formData.emergencyName,
            phone: formData.emergencyPhone,
            relation: formData.emergencyRelation,
          },
        },
        actor
      );

      setIsAddModalOpen(false);
      setFormData({
        fullName: '',
        phone: '',
        email: '',
        gender: 'PREFER_NOT_TO_SAY',
        dateOfBirth: '1996-01-01',
        emergencyName: '',
        emergencyPhone: '',
        emergencyRelation: 'Family',
        whatsappOptIn: true,
        emailOptIn: true,
      });

      await loadData();
    } catch (err: any) {
      setFormError(err?.message || 'Failed to create member record.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchive = async (memberId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to deactivate and archive ${memberName}?`)) return;
    const actor = {
      uid: profile?.uid || 'admin',
      name: profile?.name || 'Administrator',
      role: profile?.role || 'ADMIN',
    };
    await archiveMember(gymId, memberId, actor);
    await loadData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Members Directory
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-normal">
              {filteredMembers.length}
            </span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage gym memberships, profiles, contacts, and statuses
          </p>
        </div>

        {hasPermission('members.write') && (
          <Button
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            icon={<UserPlus className="w-4 h-4" />}
          >
            Add New Member
          </Button>
        )}
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="w-full md:w-80">
          <Input
            placeholder="Search by name, phone, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <Filter className="w-3.5 h-3.5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="EXPIRING">Expiring Soon</option>
              <option value="INACTIVE">Inactive</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="JOINED_DESC">Newest First</option>
              <option value="NAME_ASC">Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900/90 text-zinc-400 uppercase text-[10px] font-semibold tracking-wider border-b border-zinc-800">
              <tr>
                <th className="py-3.5 px-4">Member Name</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Current Plan</th>
                <th className="py-3.5 px-4">Expiry Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    Loading members database...
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    No members match your criteria.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => {
                  const ms = membershipMap.get(member.id);
                  const isExpiring = ms?.status === 'EXPIRING_SOON';
                  const isExpired = ms?.status === 'EXPIRED';

                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-zinc-800/30 transition-colors group cursor-pointer"
                      onClick={() => navigate(`/admin/members/${member.id}`)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs shrink-0">
                            {member.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
                              {member.fullName}
                            </p>
                            <span className="text-[10px] text-zinc-500">
                              Joined {formatReadableDate(member.joinedAt)}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-zinc-300">
                        <p>{member.phone}</p>
                        <p className="text-[11px] text-zinc-500 truncate max-w-[160px]">{member.email}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-zinc-200 font-medium">
                          {ms?.planName || 'No active plan'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {ms?.expiryDate ? (
                          <span className={isExpired ? 'text-red-400 font-semibold' : isExpiring ? 'text-amber-400 font-semibold' : 'text-zinc-300'}>
                            {formatReadableDate(ms.expiryDate)}
                          </span>
                        ) : (
                          <span className="text-zinc-500">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {isExpired ? (
                          <Badge variant="red">Expired</Badge>
                        ) : isExpiring ? (
                          <Badge variant="amber">Expiring Soon</Badge>
                        ) : member.status === 'ACTIVE' ? (
                          <Badge variant="emerald">Active</Badge>
                        ) : (
                          <Badge variant="zinc">{member.status}</Badge>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => navigate(`/admin/members/${member.id}`)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                            title="View Full Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {member.status !== 'ARCHIVED' && (
                            <button
                              onClick={() => handleArchive(member.id, member.fullName)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                              title="Archive / Deactivate"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Member Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Gym Member"
        description="Add a member into the gym database. You can assign a membership immediately after."
        size="lg"
      >
        {formError && (
          <div className="mb-4 p-3 rounded-xl border border-red-500/20 bg-red-500/10 text-xs text-red-400">
            {formError}
          </div>
        )}

        <form onSubmit={handleCreateMember} className="space-y-4">
          <Input
            label="Full Name *"
            required
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="e.g. Aryan Mehra"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone Number *"
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 99881 22334"
            />
            <Input
              label="Email Address *"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="aryan@domain.com"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 text-xs text-zinc-200 p-2 focus:border-emerald-500 focus:outline-none"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
                <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
              </select>
            </div>
            <Input
              label="Date of Birth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            />
          </div>

          <div className="pt-2 border-t border-zinc-800">
            <p className="text-xs font-semibold text-white mb-2">Emergency Contact</p>
            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Contact Name"
                value={formData.emergencyName}
                onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                placeholder="Parent / Spouse"
              />
              <Input
                label="Emergency Phone"
                value={formData.emergencyPhone}
                onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                placeholder="+91 ..."
              />
              <Input
                label="Relation"
                value={formData.emergencyRelation}
                onChange={(e) => setFormData({ ...formData, emergencyRelation: e.target.value })}
                placeholder="Family"
              />
            </div>
          </div>

          {/* Communication Preferences */}
          <div className="pt-2 border-t border-zinc-800 flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
              <input
                type="checkbox"
                checked={formData.whatsappOptIn}
                onChange={(e) => setFormData({ ...formData, whatsappOptIn: e.target.checked })}
                className="h-4 w-4 rounded border-zinc-700 text-emerald-600 focus:ring-emerald-500"
              />
              <span>WhatsApp Reminders</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
              <input
                type="checkbox"
                checked={formData.emailOptIn}
                onChange={(e) => setFormData({ ...formData, emailOptIn: e.target.checked })}
                className="h-4 w-4 rounded border-zinc-700 text-emerald-600 focus:ring-emerald-500"
              />
              <span>Email Reminders</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              Create Member Profile
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
