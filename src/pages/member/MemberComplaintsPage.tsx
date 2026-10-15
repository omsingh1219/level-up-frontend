import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Upload,
  Image as ImageIcon,
  Video,
  X,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge, Card } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { getComplaints, createComplaint } from '@/services/complaintService';
import { formatReadableDateTime } from '@/utils/dateUtils';
import type { Complaint, ComplaintCategory, ComplaintPriority } from '@/types';

export const MemberComplaintsPage: React.FC = () => {
  const { gym, profile } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [category, setCategory] = useState<ComplaintCategory>('Equipment');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<ComplaintPriority>('MEDIUM');
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const gymId = gym?.gymId || profile?.gymId || '';
  const memberId = profile?.uid || 'member-demo-rahul';

  const loadComplaints = async () => {
    if (!gymId) return;
    try {
      setLoading(true);
      let list = await getComplaints(gymId, memberId);
      if (list.length === 0) {
        // Fallback for demo user
        list = await getComplaints(gymId, 'member-1');
      }
      setComplaints(list);
    } catch (e) {
      console.error('Error fetching complaints:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, [gymId, memberId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    const validImages: File[] = [];
    let validVideo: File | null = videoFile;

    for (const file of files) {
      if (file.type.startsWith('image/')) {
        if (file.size > 5 * 1024 * 1024) {
          setError(`Image ${file.name} exceeds 5MB size limit.`);
          return;
        }
        validImages.push(file);
      } else if (file.type.startsWith('video/')) {
        if (file.size > 15 * 1024 * 1024) {
          setError(`Video ${file.name} exceeds 15MB limit.`);
          return;
        }
        validVideo = file;
      }
    }

    setPhotoFiles([...photoFiles, ...validImages]);
    if (validVideo) setVideoFile(validVideo);
    setError(null);
  };

  const removePhoto = (index: number) => {
    setPhotoFiles(photoFiles.filter((_, idx) => idx !== index));
  };

  const removeVideo = () => {
    setVideoFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      setError('Title and description are required.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setUploadProgress(0);

      await createComplaint(gymId, {
        memberId,
        memberName: profile?.name || 'Rahul Sharma',
        memberEmail: profile?.email || 'rahul.sharma@example.com',
        category,
        title,
        description,
        priority,
        photoFiles,
        videoFile: videoFile || undefined,
        onUploadProgress: (progress) => setUploadProgress(progress),
      });

      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      setPhotoFiles([]);
      setVideoFile(null);
      setUploadProgress(null);

      await loadComplaints();
    } catch (err: any) {
      setError(err?.message || 'Failed to submit problem report.');
    } finally {
      setSubmitting(false);
      setUploadProgress(null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Facility Maintenance & Reports
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-normal">
              {complaints.length}
            </span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Report broken machinery, air-conditioning issues, or cleanliness concerns to the gym staff
          </p>
        </div>

        <Button size="sm" onClick={() => setIsModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
          Report a Problem
        </Button>
      </div>

      {loading ? (
        <p className="text-xs text-zinc-500 py-12 text-center">Loading problem tickets...</p>
      ) : complaints.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-zinc-800 bg-zinc-900/40">
          <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
          <p className="text-sm font-semibold text-white">No active issues reported</p>
          <p className="text-xs text-zinc-400 mt-1 mb-4">Notice an equipment breakdown or facility issue? Let us know.</p>
          <Button size="sm" onClick={() => setIsModalOpen(true)}>File a Report</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map((c) => (
            <Card key={c.id} className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="blue">{c.category}</Badge>
                  <h3 className="text-sm font-bold text-white">{c.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={c.priority === 'HIGH' || c.priority === 'CRITICAL' ? 'red' : 'zinc'}>
                    {c.priority} Priority
                  </Badge>
                  <Badge variant={c.status === 'RESOLVED' ? 'emerald' : c.status === 'IN_PROGRESS' ? 'amber' : 'zinc'}>
                    {c.status}
                  </Badge>
                </div>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/80">
                {c.description}
              </p>

              {/* Attachments preview */}
              {c.photoUrls && c.photoUrls.length > 0 && (
                <div className="flex gap-2 overflow-x-auto py-1">
                  {c.photoUrls.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noreferrer" className="w-16 h-16 rounded-lg overflow-hidden border border-zinc-800 shrink-0">
                      <img src={url} alt="Photo" className="w-full h-full object-cover" />
                    </a>
                  ))}
                </div>
              )}

              {c.internalNotes && (
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                  <span className="font-bold">Staff Update: </span> {c.internalNotes}
                </div>
              )}

              <div className="text-[11px] text-zinc-500 pt-1">
                Reported {formatReadableDateTime(c.createdAt)}
                {c.resolvedAt && ` • Resolved ${formatReadableDateTime(c.resolvedAt)}`}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Report Problem Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Report a Problem / Maintenance Request"
        description="Our team will inspect the issue and notify you once resolved."
      >
        {error && (
          <div className="mb-4 p-3 rounded-xl border border-red-500/20 bg-red-500/10 text-xs text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 text-xs text-zinc-200 p-2.5 focus:border-emerald-500 focus:outline-none"
              >
                <option value="Equipment">Equipment</option>
                <option value="Cleanliness">Cleanliness</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Trainer">Trainer Feedback</option>
                <option value="Safety">Safety Concern</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as ComplaintPriority)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 text-xs text-zinc-200 p-2.5 focus:border-emerald-500 focus:outline-none"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High (Safety risk / broken)</option>
                <option value="CRITICAL">Critical (Immediate shutdown)</option>
              </select>
            </div>
          </div>

          <Input
            label="Problem Title *"
            required
            placeholder="e.g. Treadmill 4 motor belt slipping"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">Description *</label>
            <textarea
              rows={3}
              required
              placeholder="Describe the issue, location on the floor, and symptoms..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 text-xs text-zinc-200 p-2.5 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Media File Upload */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Attach Photos / Video (Optional)
            </label>
            <label className="flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-zinc-700 bg-zinc-950/60 hover:border-zinc-500 cursor-pointer transition-colors">
              <Upload className="w-5 h-5 text-zinc-400 mb-1" />
              <span className="text-xs text-zinc-300">Click to upload photo or video</span>
              <span className="text-[10px] text-zinc-500 mt-0.5">Images &le; 5MB (PNG/JPG), Video &le; 15MB (MP4)</span>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {/* Selected files preview */}
            {(photoFiles.length > 0 || videoFile) && (
              <div className="flex flex-wrap gap-2 mt-3">
                {photoFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-800 text-xs text-zinc-300">
                    <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="truncate max-w-[120px]">{file.name}</span>
                    <button type="button" onClick={() => removePhoto(idx)} className="text-zinc-500 hover:text-red-400">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {videoFile && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-800 text-xs text-zinc-300">
                    <Video className="w-3.5 h-3.5 text-blue-400" />
                    <span className="truncate max-w-[120px]">{videoFile.name}</span>
                    <button type="button" onClick={removeVideo} className="text-zinc-500 hover:text-red-400">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {uploadProgress !== null && (
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-[11px] text-zinc-400">
                  <span>Uploading to Cloud Storage...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              Submit Report
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
