import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Edit2, Archive, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge, Card } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { getPlans, createPlan, updatePlan } from '@/services/planService';
import type { MembershipPlan } from '@/types';

export const PlansPage: React.FC = () => {
  const { gym, profile } = useAuth();
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
  const [name, setName] = useState('');
  const [durationInDays, setDurationInDays] = useState(30);
  const [price, setPrice] = useState(1500);
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const gymId = gym?.gymId || profile?.gymId || '';

  const loadPlans = async () => {
    if (!gymId) return;
    try {
      setLoading(true);
      const list = await getPlans(gymId);
      setPlans(list);
    } catch (err) {
      console.error('Error fetching plans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, [gymId]);

  const handleOpenCreate = () => {
    setEditingPlan(null);
    setName('');
    setDurationInDays(30);
    setPrice(1500);
    setDescription('');
    setActive(true);
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (plan: MembershipPlan) => {
    setEditingPlan(plan);
    setName(plan.name);
    setDurationInDays(plan.durationInDays);
    setPrice(plan.price);
    setDescription(plan.description);
    setActive(plan.active);
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || durationInDays <= 0 || price < 0) {
      setError('Please provide a valid plan name, duration, and price.');
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

      if (editingPlan) {
        await updatePlan(
          gymId,
          editingPlan.id,
          {
            name,
            durationInDays: Number(durationInDays),
            price: Number(price),
            description,
            active,
          },
          actor
        );
      } else {
        await createPlan(
          gymId,
          {
            name,
            durationInDays: Number(durationInDays),
            price: Number(price),
            description,
            active,
          },
          actor
        );
      }

      setIsModalOpen(false);
      await loadPlans();
    } catch (err: any) {
      setError(err?.message || 'Failed to save plan.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (plan: MembershipPlan) => {
    const actor = {
      uid: profile?.uid || 'admin',
      name: profile?.name || 'Administrator',
      role: profile?.role || 'ADMIN',
    };
    await updatePlan(gymId, plan.id, { active: !plan.active }, actor);
    await loadPlans();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Membership Plans
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-normal">
              {plans.length}
            </span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Configure subscription tiers, durations in days, and pricing for your fitness center
          </p>
        </div>

        <Button size="sm" onClick={handleOpenCreate} icon={<Plus className="w-4 h-4" />}>
          Add New Plan
        </Button>
      </div>

      {loading ? (
        <p className="text-xs text-zinc-500 py-12 text-center">Loading membership plans...</p>
      ) : plans.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-zinc-800 bg-zinc-900/40">
          <CreditCard className="w-8 h-8 mx-auto text-zinc-600 mb-2" />
          <p className="text-sm font-semibold text-white">No plans configured yet</p>
          <p className="text-xs text-zinc-400 mt-1 mb-4">Create your first membership tier to start registering members.</p>
          <Button size="sm" onClick={handleOpenCreate}>Create Plan</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.map((plan) => (
            <Card key={plan.id} className="flex flex-col justify-between relative group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant={plan.active ? 'emerald' : 'zinc'}>
                    {plan.active ? 'Active' : 'Archived'}
                  </Badge>
                  <span className="text-[11px] text-zinc-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-zinc-500" /> {plan.durationInDays} days
                  </span>
                </div>

                <h3 className="text-base font-bold text-white">{plan.name}</h3>
                <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed min-h-[32px]">
                  {plan.description || 'Full facilities access.'}
                </p>

                <div className="my-5">
                  <span className="text-2xl font-black text-white">₹{plan.price.toLocaleString()}</span>
                  <span className="text-[11px] text-zinc-500"> / {plan.durationInDays}d</span>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-between gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleOpenEdit(plan)}
                  icon={<Edit2 className="w-3.5 h-3.5" />}
                  className="text-xs px-2"
                >
                  Edit
                </Button>
                <button
                  onClick={() => handleToggleActive(plan)}
                  className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                >
                  {plan.active ? 'Archive' : 'Reactivate'}
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Plan Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPlan ? 'Edit Membership Plan' : 'Create Membership Plan'}
        description="Prices and duration are applied deterministically upon assignment."
      >
        {error && (
          <div className="mb-4 p-3 rounded-xl border border-red-500/20 bg-red-500/10 text-xs text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Plan Name *"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. 3 Months Transformation"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Duration in Days *"
              type="number"
              required
              min={1}
              value={durationInDays}
              onChange={(e) => setDurationInDays(Number(e.target.value))}
              helperText="e.g. 30, 90, 180, 365"
            />
            <Input
              label="Price (₹) *"
              type="number"
              required
              min={0}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this membership include?"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 text-xs text-zinc-200 p-2.5 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300 pt-1">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-700 text-emerald-600 focus:ring-emerald-500"
            />
            <span>Active plan available for member assignment</span>
          </label>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              {editingPlan ? 'Update Plan' : 'Create Plan'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
