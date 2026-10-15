import React, { useState, useEffect } from 'react';
import { AlertCircle, Search, Filter, CheckCircle2, Clock, XCircle, FileText, Image as ImageIcon, Video } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Badge, Card } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { getComplaints, updateComplaintStatus } from '@/services/complaintService';
import { formatReadableDateTime } from '@/utils/dateUtils';
import type { Complaint, ComplaintStatus, ComplaintPriority } from '@/types';

export const ComplaintsPage: React.FC = () => {
  const { gym, profile } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  // Status Update state
  const [newStatus, setNewStatus] = useState<ComplaintStatus>('IN_PROGRESS');
  const [internalNotes, setInternalNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const gymId = gym?.gymId || profile?.gymId || '';

  const loadComplaints = async () => {
    if (!gymId) return;
    try {
      setLoading(true);
      const list = await getComplaints(gymId);
      setComplaints(list);
    } catch (err) {
      console.error('Error fetching complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, [gymId]);

  const handleOpenDetail = (c: Complaint) => {
    setSelectedComplaint(c);
    setNewStatus(c.status);
    setInternalNotes(c.internalNotes || '');
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint || !gymId) return;

    try {
      setUpdating(true);
      const actor = {
        uid: profile?.uid || 'admin',
        name: profile?.name || 'Administrator',
        role: profile?.role || 'ADMIN',
      };

      await updateComplaintStatus(
        gymId,
        selectedComplaint.id,
        newStatus,
        internalNotes,
        actor
      );

      setSelectedComplaint(null);
      await loadComplaints();
    } catch (err) {
      console.error('Failed to update complaint status:', err);
    } finally {
      setUpdating(false);
    }
  };

  const filtered = complaints.filter(c => {
    if (statusFilter === 'ALL') return true;
    return c.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Problems & Maintenance Tickets
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-normal">
              {filtered.length}
            </span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Track equipment repairs, cleanliness reports, trainer feedback, and facility requests
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                statusFilter === st
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints List Table */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900/90 text-zinc-400 uppercase text-[10px] font-semibold tracking-wider border-b border-zinc-800">
              <tr>
                <th className="py-3.5 px-4">Problem / Title</th>
                <th className="py-3.5 px-4">Member</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Media Attachments</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    Loading problem tickets...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    No problem reports in this category.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => handleOpenDetail(c)}
                    className="hover:bg-zinc-800/30 transition-colors group cursor-pointer"
                  >
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
                        {c.title}
                      </p>
                      <span className="text-[10px] text-zinc-500">
                        Reported {formatReadableDateTime(c.createdAt)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="text-zinc-200 font-medium">{c.memberName}</p>
                      <p className="text-[11px] text-zinc-500">{c.memberEmail}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant="blue">{c.category}</Badge>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant={c.priority === 'CRITICAL' || c.priority === 'HIGH' ? 'red' : 'amber'}>
                        {c.priority}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        {c.photoUrls && c.photoUrls.length > 0 && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400">
                            <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
                            {c.photoUrls.length}
                          </span>
                        )}
                        {c.videoUrl && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400">
                            <Video className="w-3.5 h-3.5 text-blue-400" />
                          </span>
                        )}
                        {(!c.photoUrls || c.photoUrls.length === 0) && !c.videoUrl && (
                          <span className="text-zinc-500 text-[11px]">None</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`text-[11px] px-2 py-0.5 rounded font-semibold ${
                        c.status === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-400' :
                        c.status === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-400' :
                        c.status === 'REJECTED' ? 'bg-zinc-800 text-zinc-500' :
                        'bg-amber-500/10 text-amber-400'
                      }`}>
                        {c.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Button size="sm" variant="ghost" className="text-xs">
                        Review
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Details & Resolution Modal */}
      {selectedComplaint && (
        <Modal
          isOpen={Boolean(selectedComplaint)}
          onClose={() => setSelectedComplaint(null)}
          title={`Problem Ticket: ${selectedComplaint.title}`}
          description={`Reported by ${selectedComplaint.memberName} on ${formatReadableDateTime(selectedComplaint.createdAt)}`}
          size="lg"
        >
          <form onSubmit={handleUpdateStatus} className="space-y-4">
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="blue">{selectedComplaint.category}</Badge>
                <Badge variant={selectedComplaint.priority === 'HIGH' || selectedComplaint.priority === 'CRITICAL' ? 'red' : 'amber'}>
                  {selectedComplaint.priority} Priority
                </Badge>
              </div>

              <div>
                <p className="text-xs text-zinc-400 font-medium">Description</p>
                <p className="text-xs text-zinc-200 mt-1 leading-relaxed bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/80">
                  {selectedComplaint.description}
                </p>
              </div>

              {/* Photo & Video Attachments Preview */}
              {selectedComplaint.photoUrls && selectedComplaint.photoUrls.length > 0 && (
                <div>
                  <p className="text-xs text-zinc-400 font-medium mb-2">Attached Photos</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {selectedComplaint.photoUrls.map((url, idx) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg overflow-hidden border border-zinc-800 group relative block h-24 bg-zinc-900"
                      >
                        <img src={url} alt={`Attachment ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Resolution Controls */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Update Ticket Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as ComplaintStatus)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 text-xs text-zinc-200 p-2.5 focus:border-emerald-500 focus:outline-none"
              >
                <option value="OPEN">OPEN (Awaiting Review)</option>
                <option value="IN_PROGRESS">IN_PROGRESS (Technician / Staff Assigned)</option>
                <option value="RESOLVED">RESOLVED (Repaired / Handled)</option>
                <option value="REJECTED">REJECTED (Not Applicable / Duplicate)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Internal Staff Notes & Solution Remarks
              </label>
              <textarea
                rows={3}
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Log technician details, ETA, or resolution summary..."
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 text-xs text-zinc-200 p-2.5 focus:border-emerald-500 focus:outline-none"
              />
              <p className="text-[11px] text-zinc-500 mt-1">
                Updating status will automatically trigger an In-App notification to the reporting member.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
              <Button type="button" variant="ghost" onClick={() => setSelectedComplaint(null)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={updating}>
                Save & Notify Member
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
