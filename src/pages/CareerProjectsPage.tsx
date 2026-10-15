import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  FolderGit2,
  ExternalLink,
  CheckCircle2,
  Clock,
  Sparkles,
  Trash2,
  Edit3,
  Building,
  DollarSign,
  MapPin,
  Calendar,
} from 'lucide-react';
import { useLevelUp } from '@/contexts/LevelUpContext';
import { Project, ProjectStatus, CareerMilestone, JobApplication, ApplicationStatus } from '@/types/levelup';

export const CareerProjectsPage: React.FC = () => {
  const {
    data,
    today,
    addProject,
    updateProject,
    deleteProject,
    toggleMilestone,
    addMilestone,
    addJobApplication,
    updateJobApplication,
    deleteJobApplication,
  } = useLevelUp();

  // Tab: Projects, Career Roadmap, Applications
  const [activeTab, setActiveTab] = useState<'projects' | 'roadmap' | 'applications'>('projects');

  // Project Modal
  const [showProjModal, setShowProjModal] = useState(false);
  const [projTitle, setProjTitle] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projTech, setProjTech] = useState('');
  const [projGithub, setProjGithub] = useState('');
  const [projLive, setProjLive] = useState('');
  const [projStatus, setProjStatus] = useState<ProjectStatus>('In Progress');
  const [projPercent, setProjPercent] = useState(60);

  // Application Modal
  const [showAppModal, setShowAppModal] = useState(false);
  const [appCompany, setAppCompany] = useState('');
  const [appRole, setAppRole] = useState('');
  const [appStatus, setAppStatus] = useState<ApplicationStatus>('Applied');
  const [appSalary, setAppSalary] = useState('');
  const [appLocation, setAppLocation] = useState('');
  const [appNotes, setAppNotes] = useState('');

  // Milestone Modal
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneCategory, setMilestoneCategory] = useState<CareerMilestone['category']>('Projects');

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle.trim()) return;

    addProject({
      title: projTitle.trim(),
      description: projDesc.trim(),
      techStack: projTech
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      githubUrl: projGithub.trim() || undefined,
      liveUrl: projLive.trim() || undefined,
      status: projStatus,
      completionPercentage: Number(projPercent) || 0,
    });

    setProjTitle('');
    setProjDesc('');
    setProjTech('');
    setProjGithub('');
    setProjLive('');
    setShowProjModal(false);
  };

  const handleCreateApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appCompany.trim() || !appRole.trim()) return;

    addJobApplication({
      company: appCompany.trim(),
      role: appRole.trim(),
      applicationDate: today,
      status: appStatus,
      salary: appSalary.trim() || undefined,
      location: appLocation.trim() || undefined,
      notes: appNotes.trim() || undefined,
    });

    setAppCompany('');
    setAppRole('');
    setAppSalary('');
    setAppLocation('');
    setAppNotes('');
    setShowAppModal(false);
  };

  const handleCreateMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneTitle.trim()) return;

    addMilestone({
      title: milestoneTitle.trim(),
      category: milestoneCategory,
      completed: false,
      targetDate: today,
    });

    setMilestoneTitle('');
    setShowMilestoneModal(false);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects & Career Roadmap</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Showcase technical portfolio projects, track career milestones, and manage job applications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'projects' && (
            <button
              onClick={() => setShowProjModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Project</span>
            </button>
          )}

          {activeTab === 'roadmap' && (
            <button
              onClick={() => setShowMilestoneModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Milestone</span>
            </button>
          )}

          {activeTab === 'applications' && (
            <button
              onClick={() => setShowAppModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Application</span>
            </button>
          )}
        </div>
      </div>

      {/* TABS */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setActiveTab('projects')}
          className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'projects'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          Portfolio Projects ({data.projects.length})
        </button>

        <button
          onClick={() => setActiveTab('roadmap')}
          className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'roadmap'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          Career Milestones ({data.milestones.filter((m) => m.completed).length}/{data.milestones.length})
        </button>

        <button
          onClick={() => setActiveTab('applications')}
          className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'applications'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          Application Tracker ({data.applications.length})
        </button>
      </div>

      {/* TAB 1: PROJECTS */}
      {activeTab === 'projects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.projects.map((proj) => (
            <div
              key={proj.id}
              className="p-5 rounded-xl bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      proj.status === 'Completed' || proj.status === 'Published'
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : proj.status === 'In Progress'
                        ? 'bg-indigo-500/10 text-indigo-500'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    {proj.status}
                  </span>

                  <button
                    onClick={() => deleteProject(proj.id)}
                    className="p-1 text-zinc-400 hover:text-rose-500 cursor-pointer"
                    title="Delete Project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="text-sm font-bold mt-2.5 text-zinc-900 dark:text-zinc-100">{proj.title}</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-3 leading-relaxed">
                  {proj.description}
                </p>

                <div className="mt-3 flex flex-wrap gap-1">
                  {proj.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="text-[10px] px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800/70 text-zinc-600 dark:text-zinc-400 font-mono"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800/60">
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                  <span>Completion</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {proj.completionPercentage}%
                  </span>
                </div>
                <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden mb-3">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${proj.completionPercentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  {proj.githubUrl ? (
                    <a
                      href={proj.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-zinc-600 dark:text-zinc-400 hover:text-emerald-500 flex items-center gap-1 font-medium"
                    >
                      <FolderGit2 className="w-3.5 h-3.5" />
                      <span>Code Repository</span>
                    </a>
                  ) : (
                    <span className="text-zinc-400 text-[11px]">Private repo</span>
                  )}

                  {proj.liveUrl && (
                    <a
                      href={proj.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>Live Demo</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: ROADMAP MILESTONES */}
      {activeTab === 'roadmap' && (
        <div className="p-5 rounded-xl bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800/80 shadow-xs max-w-3xl">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/60 mb-4">
            <h2 className="text-sm font-bold tracking-tight">Software Engineering Career Milestones</h2>
            <span className="text-xs text-zinc-500">Tap milestone to mark complete</span>
          </div>

          <div className="space-y-3">
            {data.milestones.map((ms) => (
              <div
                key={ms.id}
                onClick={() => toggleMilestone(ms.id)}
                className={`p-3.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                  ms.completed
                    ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
                    : 'bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                      ms.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-zinc-300 dark:border-zinc-700'
                    }`}
                  >
                    {ms.completed && <CheckCircle2 className="w-3.5 h-3.5 fill-current" />}
                  </div>
                  <div>
                    <div
                      className={`text-xs font-semibold ${
                        ms.completed ? 'line-through text-zinc-400' : 'text-zinc-900 dark:text-zinc-100'
                      }`}
                    >
                      {ms.title}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                    {ms.category}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      ms.completed ? 'bg-emerald-500/20 text-emerald-500' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {ms.completed ? 'Achieved' : 'In Progress'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: APPLICATIONS */}
      {activeTab === 'applications' && (
        <div className="p-5 rounded-xl bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800/80 shadow-xs overflow-x-auto">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/60 mb-4">
            <h2 className="text-sm font-bold tracking-tight">Internship & Job Applications</h2>
            <button
              onClick={() => setShowAppModal(true)}
              className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
            >
              + Add Application
            </button>
          </div>

          <table className="w-full text-left text-xs min-w-[700px]">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 font-semibold">
                <th className="py-2.5 px-3">Company</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-2">Status</th>
                <th className="py-2.5 px-2">Applied Date</th>
                <th className="py-2.5 px-2">Compensation</th>
                <th className="py-2.5 px-3">Notes</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {data.applications.map((app) => (
                <tr key={app.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition-colors">
                  <td className="py-3 px-3 font-bold text-zinc-900 dark:text-zinc-100">
                    <div className="flex items-center gap-2">
                      <Building className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{app.company}</span>
                    </div>
                  </td>

                  <td className="py-3 px-3 text-zinc-800 dark:text-zinc-200">{app.role}</td>

                  <td className="py-3 px-2">
                    <select
                      value={app.status}
                      onChange={(e) => updateJobApplication(app.id, { status: e.target.value as ApplicationStatus })}
                      className="px-2 py-0.5 rounded text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none cursor-pointer"
                    >
                      <option value="Bookmarked">Bookmarked</option>
                      <option value="Applied">Applied</option>
                      <option value="Screening">Screening</option>
                      <option value="Interview">Interview</option>
                      <option value="Offer">Offer 🎉</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </td>

                  <td className="py-3 px-2 text-zinc-400 text-[11px]">{app.applicationDate}</td>
                  <td className="py-3 px-2 text-zinc-500 font-mono text-[11px]">{app.salary || '—'}</td>
                  <td className="py-3 px-3 text-zinc-500 text-[11px] max-w-xs truncate">{app.notes || '—'}</td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => deleteJobApplication(app.id)}
                      className="p-1 text-zinc-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ADD PROJECT MODAL */}
      {showProjModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-base font-bold mb-4">Add Technical Portfolio Project</h3>
            <form onSubmit={handleCreateProject} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed In-Memory Key-Value Store"
                  value={projTitle}
                  onChange={(e) => setProjTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="What core problems does this project solve? Key technical highlights?"
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                  Tech Stack (Comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="Go, Docker, Redis, gRPC, Prometheus"
                  value={projTech}
                  onChange={(e) => setProjTech(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                    GitHub URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={projGithub}
                    onChange={(e) => setProjGithub(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                    Live Demo URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={projLive}
                    onChange={(e) => setProjLive(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                    Status
                  </label>
                  <select
                    value={projStatus}
                    onChange={(e) => setProjStatus(e.target.value as ProjectStatus)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Idea">Idea</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Published">Published</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                    Completion %
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={projPercent}
                    onChange={(e) => setProjPercent(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowProjModal(false)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD APPLICATION MODAL */}
      {showAppModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-base font-bold mb-4">Log Internship / Job Application</h3>
            <form onSubmit={handleCreateApplication} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stripe / Google / Atlassian"
                  value={appCompany}
                  onChange={(e) => setAppCompany(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                  Role Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Software Engineering Intern — Summer 2027"
                  value={appRole}
                  onChange={(e) => setAppRole(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                    Application Stage
                  </label>
                  <select
                    value={appStatus}
                    onChange={(e) => setAppStatus(e.target.value as ApplicationStatus)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Bookmarked">Bookmarked</option>
                    <option value="Applied">Applied</option>
                    <option value="Screening">Screening</option>
                    <option value="Interview">Interview</option>
                    <option value="Offer">Offer 🎉</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                    Salary / Stipend
                  </label>
                  <input
                    type="text"
                    placeholder="$55/hr or ₹1.2L/mo"
                    value={appSalary}
                    onChange={(e) => setAppSalary(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                  Notes / Interview Timeline
                </label>
                <textarea
                  rows={2}
                  placeholder="Recruiter contact, OA results, next rounds..."
                  value={appNotes}
                  onChange={(e) => setAppNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAppModal(false)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
                >
                  Save Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD MILESTONE MODAL */}
      {showMilestoneModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-base font-bold mb-4">Add Career Roadmap Milestone</h3>
            <form onSubmit={handleCreateMilestone} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                  Milestone Goal *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Crack 150 LeetCode problems & publish portfolio"
                  value={milestoneTitle}
                  onChange={(e) => setMilestoneTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                  Category
                </label>
                <select
                  value={milestoneCategory}
                  onChange={(e) => setMilestoneCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-emerald-500"
                >
                  <option value="DSA">Data Structures & Algorithms</option>
                  <option value="Projects">Technical Projects</option>
                  <option value="Resume">Resume & Branding</option>
                  <option value="Internships">Internship Applications</option>
                  <option value="Interviews">Technical Interviews</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowMilestoneModal(false)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
                >
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
