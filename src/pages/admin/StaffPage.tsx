import React, { useState, useEffect } from 'react';
import { UserCog, Plus, Shield, Check, X, Phone, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge, Card } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { getStaffMembers, createStaffMember, toggleStaffStatus } from '@/services/staffService';
import type { UserProfile, StaffPermission } from '@/types';

export const StaffPage: React.FC = () => {
  const { gym, profile } = useAuth();
  const [staffList, setStaffList] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<StaffPermission[]>([
    'members.read',
    'members.write',
    'renewals.read',
    'renewals.write',
    'complaints.read',
    'complaints.write',
    'products.read',
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const gymId = gym?.gymId || profile?.gymId || '';

  const allPermissions: { key: StaffPermission; label: string; desc: string }[] = [
    { key: 'members.read', label: 'View Members', desc: 'Read member directory and profiles' },
    { key: 'members.write', label: 'Create & Edit Members', desc: 'Add or modify member records' },
    { key: 'members.delete', label: 'Archive Members', desc: 'Deactivate member accounts' },
    { key: 'renewals.read', label: 'View Renewals', desc: 'Inspect historical renewal logs' },
    { key: 'renewals.write', label: 'Process Renewals', desc: 'Extend and renew memberships' },
    { key: 'complaints.read', label: 'View Problems', desc: 'Read reported member tickets' },
    { key: 'complaints.write', label: 'Resolve Problems', desc: 'Change ticket status and add remarks' },
    { key: 'products.read', label: 'View Store Inventory', desc: 'Browse products and stock' },
    { key: 'products.write', label: 'Manage Products', desc: 'Add, update stock and prices' },
    { key: 'analytics.read', label: 'View Analytics', desc: 'Access revenue and growth charts' },
  ];

  const loadStaff = async () => {
    if (!gymId) return;
    try {
      setLoading(true);
      const list = await getStaffMembers(gymId);
      setStaffList(list);
    } catch (err) {
      console.error('Error fetching staff list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, [gymId]);

  const togglePermission = (perm: StaffPermission) => {
    if (selectedPermissions.includes(perm)) {
      setSelectedPermissions(selectedPermissions.filter(p => p !== perm));
    } else {
      setSelectedPermissions([...selectedPermissions, perm]);
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      setError('Staff name and email are required.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const actor = {
        uid: profile?.uid || 'admin',
        name: profile?.name || 'Administrator',
        role: profile?.role || 'ADMIN',
      };

      await createStaffMember(
        gymId,
        {
          name,
          email,
          phone,
          permissions: selectedPermissions,
        },
        actor
      );

      setIsModalOpen(false);
      setName('');
      setEmail('');
      setPhone('');
      await loadStaff();
    } catch (err: any) {
      setError(err?.message || 'Failed to create staff member.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (s: UserProfile) => {
    const actor = {
      uid: profile?.uid || 'admin',
      name: profile?.name || 'Administrator',
      role: profile?.role || 'ADMIN',
    };
    await toggleStaffStatus(gymId, s.uid, !s.active, actor);
    await loadStaff();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Staff Team & Delegation
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-normal">
              {staffList.length}
            </span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Assign operations, member management, and maintenance tasks with granular permissions
          </p>
        </div>

        <Button size="sm" onClick={() => setIsModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
          Add Staff Member
        </Button>
      </div>

      {loading ? (
        <p className="text-xs text-zinc-500 py-12 text-center">Loading gym staff team...</p>
      ) : staffList.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-zinc-800 bg-zinc-900/40">
          <UserCog className="w-8 h-8 mx-auto text-zinc-600 mb-2" />
          <p className="text-sm font-semibold text-white">No staff members created yet</p>
          <p className="text-xs text-zinc-400 mt-1 mb-4">Add your gym managers, trainers, and front-desk coordinators.</p>
          <Button size="sm" onClick={() => setIsModalOpen(true)}>Add Staff Member</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {staffList.map((s) => (
            <Card key={s.uid} className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold flex items-center justify-center text-sm">
                    {s.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{s.name}</h3>
                    <p className="text-xs text-zinc-400">{s.email}</p>
                    {s.phone && <p className="text-[11px] text-zinc-500">{s.phone}</p>}
                  </div>
                </div>

                <Badge variant={s.active ? 'emerald' : 'zinc'}>
                  {s.active ? 'Active' : 'Disabled'}
                </Badge>
              </div>

              {/* Permissions Tags */}
              <div className="pt-2 border-t border-zinc-800/80">
                <p className="text-[11px] font-semibold text-zinc-400 mb-2">Granted Permissions:</p>
                <div className="flex flex-wrap gap-1.5">
                  {s.permissions && s.permissions.length > 0 ? (
                    s.permissions.map((p) => (
                      <span key={p} className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">
                        {p}
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] text-zinc-500 italic">No specific permissions assigned.</span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800/80 flex justify-end">
                <button
                  onClick={() => handleToggleActive(s)}
                  className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  {s.active ? 'Deactivate Account' : 'Re-enable Account'}
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Staff Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Staff Team Member"
        description="Configure access permissions for front-desk or management staff."
        size="lg"
      >
        {error && (
          <div className="mb-4 p-3 rounded-xl border border-red-500/20 bg-red-500/10 text-xs text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleCreateStaff} className="space-y-4">
          <Input
            label="Staff Full Name *"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Pooja Hegde"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Staff Email *"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="pooja@gym.com"
            />
            <Input
              label="Contact Phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 ..."
            />
          </div>

          <div className="pt-2 border-t border-zinc-800">
            <p className="text-xs font-semibold text-white mb-2">Configure Access Permissions:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {allPermissions.map((p) => {
                const isChecked = selectedPermissions.includes(p.key);
                return (
                  <div
                    key={p.key}
                    onClick={() => togglePermission(p.key)}
                    className={`p-2.5 rounded-lg border text-left cursor-pointer transition-colors ${
                      isChecked
                        ? 'border-emerald-500/40 bg-emerald-500/10'
                        : 'border-zinc-800 bg-zinc-950/60 hover:bg-zinc-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold ${isChecked ? 'text-emerald-400' : 'text-zinc-300'}`}>
                        {p.label}
                      </span>
                      {isChecked && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <span className="text-[10px] text-zinc-500 block mt-0.5">{p.desc}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              Create Staff Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
