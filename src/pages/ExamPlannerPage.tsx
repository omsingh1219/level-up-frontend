import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  Star,
  Trash2,
  Edit3,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useLevelUp } from '@/contexts/LevelUpContext';
import { Exam, TopicStatus, Unit } from '@/types/levelup';

export const ExamPlannerPage: React.FC = () => {
  const { data, today, addExam, updateExam, deleteExam, updateTopicStatus } = useLevelUp();

  // Selected Exam for drill-down syllabus view
  const [selectedExamId, setSelectedExamId] = useState<string>(data.exams[0]?.id || '');

  // Add Exam Modal
  const [showExamModal, setShowExamModal] = useState(false);
  const [subject, setSubject] = useState('');
  const [code, setCode] = useState('');
  const [examDate, setExamDate] = useState('');
  const [examTime, setExamTime] = useState('09:30 AM');
  const [targetGrade, setTargetGrade] = useState('A+ (95%)');

  // Add Topic Modal
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [targetUnitId, setTargetUnitId] = useState('');
  const [newTopicName, setNewTopicName] = useState('');

  // Revision timetable generator modal
  const [showTimetableModal, setShowTimetableModal] = useState(false);

  const activeExam = data.exams.find((e) => e.id === selectedExamId) || data.exams[0];

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !examDate) return;

    addExam({
      subject: subject.trim(),
      code: code.trim() || undefined,
      examDate,
      examTime,
      targetGrade,
      units: [
        {
          id: `u-${Date.now()}-1`,
          title: 'Unit 1: Core Fundamentals & Theory',
          topics: [
            { id: `t-${Date.now()}-1`, name: 'Introduction & Basic Terminology', status: 'not_started', confidence: 3 },
            { id: `t-${Date.now()}-2`, name: 'Main Architectural Concepts', status: 'not_started', confidence: 2 },
          ],
        },
      ],
    });

    setSubject('');
    setCode('');
    setShowExamModal(false);
  };

  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim() || !activeExam || !targetUnitId) return;

    const updatedUnits = activeExam.units.map((u) => {
      if (u.id !== targetUnitId) return u;
      return {
        ...u,
        topics: [
          ...u.topics,
          {
            id: `t-${Date.now()}`,
            name: newTopicName.trim(),
            status: 'not_started' as TopicStatus,
            confidence: 3,
          },
        ],
      };
    });

    updateExam(activeExam.id, { units: updatedUnits });
    setNewTopicName('');
    setShowTopicModal(false);
  };

  const handleAddUnit = () => {
    if (!activeExam) return;
    const newUnitNumber = activeExam.units.length + 1;
    const newUnit: Unit = {
      id: `u-${Date.now()}`,
      title: `Unit ${newUnitNumber}: New Syllabus Module`,
      topics: [],
    };
    updateExam(activeExam.id, { units: [...activeExam.units, newUnit] });
  };

  // Syllabus stats
  const totalTopics = activeExam ? activeExam.units.flatMap((u) => u.topics).length : 0;
  const revisedTopics = activeExam
    ? activeExam.units.flatMap((u) => u.topics).filter((t) => t.status === 'revised').length
    : 0;
  const learningTopics = activeExam
    ? activeExam.units.flatMap((u) => u.topics).filter((t) => t.status === 'learning').length
    : 0;
  const notStartedTopics = totalTopics - revisedTopics - learningTopics;
  const syllabusPercent = totalTopics > 0 ? Math.round((revisedTopics / totalTopics) * 100) : 0;

  // Days left
  const daysRemaining = activeExam
    ? Math.ceil((new Date(activeExam.examDate).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  // Timetable Generator: calculates realistic daily topics required based on days remaining
  const topicsNeedingRevision = activeExam
    ? activeExam.units.flatMap((u) => u.topics).filter((t) => t.status !== 'revised')
    : [];
  const dailyPace = daysRemaining > 0 ? (topicsNeedingRevision.length / daysRemaining).toFixed(1) : 'N/A';

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Exam Preparation & Syllabus Planner</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Unit-by-unit syllabus breakdown, confidence tracking, and realistic revision timetable.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTimetableModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Generate Revision Plan</span>
          </button>

          <button
            onClick={() => setShowExamModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Exam</span>
          </button>
        </div>
      </div>

      {/* EXAMS SELECTOR CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {data.exams.map((exam) => {
          const daysLeft = Math.ceil(
            (new Date(exam.examDate).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24)
          );
          const isSelected = exam.id === selectedExamId;
          const isUrgent = daysLeft <= 7;

          const total = exam.units.flatMap((u) => u.topics).length;
          const revised = exam.units.flatMap((u) => u.topics).filter((t) => t.status === 'revised').length;
          const pct = total > 0 ? Math.round((revised / total) * 100) : 0;

          return (
            <div
              key={exam.id}
              onClick={() => setSelectedExamId(exam.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-zinc-900 dark:bg-zinc-800 text-white border-zinc-900 dark:border-zinc-700 shadow-md ring-1 ring-emerald-500/50'
                  : 'bg-white dark:bg-[#111114] border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-bold truncate max-w-[170px]">{exam.subject}</div>
                  <div className={`text-[11px] ${isSelected ? 'text-zinc-300' : 'text-zinc-400'}`}>
                    {exam.code} • {exam.examDate}
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isUrgent
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : isSelected
                      ? 'bg-zinc-800 text-emerald-400'
                      : 'bg-indigo-500/10 text-indigo-500'
                  }`}
                >
                  {daysLeft}d left
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between text-[11px]">
                <span className={isSelected ? 'text-zinc-300' : 'text-zinc-500'}>
                  {revised}/{total} topics ({pct}%)
                </span>
                <span className="font-semibold text-emerald-400">{exam.targetGrade}</span>
              </div>
              <div className="mt-1.5 w-full bg-zinc-200 dark:bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {activeExam ? (
        <div className="space-y-6">
          {/* ACTIVE EXAM OVERVIEW BAR */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{activeExam.subject}</h2>
                {activeExam.code && (
                  <span className="text-xs px-2 py-0.5 rounded font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    {activeExam.code}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1">
                <span>Date: {activeExam.examDate} at {activeExam.examTime}</span>
                <span>•</span>
                <span className="text-amber-500 font-bold">{daysRemaining} days remaining</span>
                <span>•</span>
                <span>Target: {activeExam.targetGrade}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleAddUnit}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
              >
                + Add Unit
              </button>
              <button
                onClick={() => deleteExam(activeExam.id)}
                className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-rose-500/10 text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer"
                title="Delete Exam"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* SYLLABUS UNITS & TOPICS */}
          <div className="space-y-4">
            {activeExam.units.map((unit) => (
              <div
                key={unit.id}
                className="p-5 rounded-xl bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800/80 shadow-xs"
              >
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/60 mb-3">
                  <div className="flex items-center gap-2 font-bold text-xs text-zinc-800 dark:text-zinc-200">
                    <BookOpen className="w-4 h-4 text-emerald-500" />
                    <span>{unit.title}</span>
                  </div>

                  <button
                    onClick={() => {
                      setTargetUnitId(unit.id);
                      setShowTopicModal(true);
                    }}
                    className="text-xs text-emerald-600 dark:text-emerald-400 font-medium hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Topic</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {unit.topics.map((topic) => (
                    <div
                      key={topic.id}
                      className="p-3 rounded-lg bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 font-medium text-zinc-900 dark:text-zinc-100">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            topic.status === 'revised'
                              ? 'bg-emerald-500'
                              : topic.status === 'learning'
                              ? 'bg-amber-500'
                              : 'bg-zinc-400'
                          }`}
                        />
                        <span>{topic.name}</span>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Confidence Stars */}
                        <div className="flex items-center gap-0.5" title="Confidence Rating (1-5 stars)">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() =>
                                updateTopicStatus(activeExam.id, unit.id, topic.id, topic.status, star)
                              }
                              className="cursor-pointer"
                            >
                              <Star
                                className={`w-3.5 h-3.5 ${
                                  star <= topic.confidence
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-zinc-300 dark:text-zinc-700'
                                }`}
                              />
                            </button>
                          ))}
                        </div>

                        {/* Status Selector */}
                        <select
                          value={topic.status}
                          onChange={(e) =>
                            updateTopicStatus(
                              activeExam.id,
                              unit.id,
                              topic.id,
                              e.target.value as TopicStatus,
                              topic.confidence
                            )
                          }
                          className={`px-2.5 py-1 rounded-md text-xs font-semibold focus:outline-none cursor-pointer ${
                            topic.status === 'revised'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : topic.status === 'learning'
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                          }`}
                        >
                          <option value="not_started">Not Started</option>
                          <option value="learning">In Learning</option>
                          <option value="revised">Revised ✓</option>
                        </select>
                      </div>
                    </div>
                  ))}

                  {unit.topics.length === 0 && (
                    <div className="py-4 text-center text-zinc-400 text-xs">
                      No topics added in this unit yet.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="py-16 text-center text-zinc-400 text-sm">
          No exams scheduled yet. Click "Add Exam" to get started!
        </div>
      )}

      {/* REVISION PLANNER GENERATOR MODAL */}
      {showTimetableModal && activeExam && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                <h3 className="text-base font-bold">Smart Revision Timetable</h3>
              </div>
              <button
                onClick={() => setShowTimetableModal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-800 dark:text-indigo-300">
                <div className="font-bold text-sm mb-1">
                  Target: {activeExam.subject} in {daysRemaining} days
                </div>
                <p>
                  You have <strong>{topicsNeedingRevision.length} topics</strong> left to complete. To finish all topics
                  with 1 revision day buffer, you need to master <strong>{dailyPace} topics/day</strong>.
                </p>
              </div>

              <div className="space-y-2">
                <div className="font-semibold text-zinc-800 dark:text-zinc-200">Recommended Daily Study Split:</div>
                <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1.5 text-zinc-600 dark:text-zinc-400">
                  <div className="flex justify-between">
                    <span>Active Recall & Numericals</span>
                    <strong className="text-zinc-900 dark:text-zinc-100">90 mins</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Past Year Exam Question Practice</span>
                    <strong className="text-zinc-900 dark:text-zinc-100">60 mins</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Low-Confidence Topic Patching</span>
                    <strong className="text-zinc-900 dark:text-zinc-100">45 mins</strong>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="font-semibold text-zinc-800 dark:text-zinc-200">Highest Urgency Topics to Revise:</div>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {topicsNeedingRevision
                    .sort((a, b) => a.confidence - b.confidence)
                    .slice(0, 5)
                    .map((t) => (
                      <div
                        key={t.id}
                        className="p-2 rounded bg-zinc-100 dark:bg-zinc-800 flex items-center justify-between"
                      >
                        <span>{t.name}</span>
                        <span className="text-[10px] text-amber-500 font-bold">
                          Confidence: {t.confidence}/5
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowTimetableModal(false)}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                >
                  Got It, Let's Execute
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD EXAM MODAL */}
      {showExamModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-base font-bold mb-4">Add Upcoming Subject Exam</h3>
            <form onSubmit={handleCreateExam} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                  Subject Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Systems"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                    Course Code (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="CS308"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                    Target Grade
                  </label>
                  <input
                    type="text"
                    placeholder="A+ / 95%"
                    value={targetGrade}
                    onChange={(e) => setTargetGrade(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                    Exam Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                    Exam Time
                  </label>
                  <input
                    type="text"
                    placeholder="09:30 AM"
                    value={examTime}
                    onChange={(e) => setExamTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowExamModal(false)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
                >
                  Add Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD TOPIC MODAL */}
      {showTopicModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-base font-bold mb-4">Add Topic to Syllabus</h3>
            <form onSubmit={handleAddTopic} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                  Topic Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Raft Consensus Algorithm & Leader Election"
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTopicModal(false)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
                >
                  Add Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
