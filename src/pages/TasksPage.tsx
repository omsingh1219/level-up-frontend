import React, { useState } from 'react';
import {
  ListTodo,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Pin,
  Trash2,
  Edit3,
  Filter,
  Columns,
  List,
  Calendar,
  Sparkles,
  ArrowRight,
  MoveRight,
} from 'lucide-react';
import { useLevelUp } from '@/contexts/LevelUpContext';
import { Task, TaskCategory, Priority, TaskStatus } from '@/types/levelup';

export const TasksPage: React.FC = () => {
  const { data, today, addTask, updateTask, deleteTask, toggleTaskStatus, toggleTopThree } = useLevelUp();

  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<TaskCategory>('University');
  const [priority, setPriority] = useState<Priority>('High');
  const [deadline, setDeadline] = useState(today);
  const [estimatedMinutes, setEstimatedMinutes] = useState(60);
  const [isTopThree, setIsTopThree] = useState(false);

  const categories: (TaskCategory | 'All')[] = ['All', 'University', 'Coding', 'Projects', 'Career', 'Personal'];

  const openAddModal = () => {
    setEditingTaskId(null);
    setTitle('');
    setDescription('');
    setSubject('');
    setCategory('University');
    setPriority('High');
    setDeadline(today);
    setEstimatedMinutes(45);
    setIsTopThree(false);
    setShowModal(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTaskId(task.id);
    setTitle(task.title);
    setDescription(task.description || '');
    setSubject(task.subject || '');
    setCategory(task.category);
    setPriority(task.priority);
    setDeadline(task.deadline);
    setEstimatedMinutes(task.estimatedMinutes);
    setIsTopThree(task.isTopThreeToday);
    setShowModal(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingTaskId) {
      updateTask(editingTaskId, {
        title: title.trim(),
        description: description.trim(),
        subject: subject.trim() || 'General',
        category,
        priority,
        deadline,
        estimatedMinutes: Number(estimatedMinutes),
        isTopThreeToday: isTopThree,
      });
    } else {
      addTask({
        title: title.trim(),
        description: description.trim(),
        subject: subject.trim() || 'General',
        category,
        priority,
        status: 'todo',
        deadline,
        estimatedMinutes: Number(estimatedMinutes),
        isTopThreeToday: isTopThree,
      });
    }
    setShowModal(false);
  };

  const moveTaskStatus = (id: string, newStatus: TaskStatus) => {
    updateTask(id, {
      status: newStatus,
      completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined,
    });
  };

  // Filter tasks
  const filteredTasks = data.tasks.filter((t) => {
    if (categoryFilter !== 'All' && t.category !== categoryFilter) return false;
    if (priorityFilter !== 'All' && t.priority !== priorityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        (t.subject && t.subject.toLowerCase().includes(q)) ||
        (t.description && t.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Kanban Columns
  const todoTasks = filteredTasks.filter((t) => t.status === 'todo');
  const inProgressTasks = filteredTasks.filter((t) => t.status === 'in_progress');
  const completedTasks = filteredTasks.filter((t) => t.status === 'completed');

  // Stats
  const totalTasks = data.tasks.length;
  const completedCount = data.tasks.filter((t) => t.status === 'completed').length;
  const overdueCount = data.tasks.filter((t) => t.status !== 'completed' && t.deadline < today).length;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Study Planner & Tasks</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Organize academic workloads, coding challenges, and career milestones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-zinc-900 dark:bg-zinc-800 text-white'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Board</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-zinc-900 dark:bg-zinc-800 text-white'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* STATS STRIP & FILTERS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Quick Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                  : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Priority Filter & Search */}
        <div className="flex items-center gap-2">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 focus:outline-none"
          >
            <option value="All">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 w-44"
          />

          {overdueCount > 0 && (
            <span className="px-2 py-1 rounded-lg text-[11px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center gap-1 shrink-0">
              <AlertCircle className="w-3 h-3" />
              <span>{overdueCount} Overdue</span>
            </span>
          )}
        </div>
      </div>

      {/* KANBAN BOARD VIEW */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* TO DO COLUMN */}
          <div className="p-4 rounded-xl bg-zinc-100/70 dark:bg-[#111114] border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200/60 dark:border-zinc-800/60 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-zinc-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  To Do ({todoTasks.length})
                </h2>
              </div>
              <button
                onClick={openAddModal}
                className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto">
              {todoTasks.map((task) => renderTaskCard(task))}
              {todoTasks.length === 0 && (
                <div className="py-12 text-center text-zinc-400 text-xs">No tasks to do</div>
              )}
            </div>
          </div>

          {/* IN PROGRESS COLUMN */}
          <div className="p-4 rounded-xl bg-zinc-100/70 dark:bg-[#111114] border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200/60 dark:border-zinc-800/60 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  In Progress ({inProgressTasks.length})
                </h2>
              </div>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto">
              {inProgressTasks.map((task) => renderTaskCard(task))}
              {inProgressTasks.length === 0 && (
                <div className="py-12 text-center text-zinc-400 text-xs">No tasks in progress</div>
              )}
            </div>
          </div>

          {/* COMPLETED COLUMN */}
          <div className="p-4 rounded-xl bg-zinc-100/70 dark:bg-[#111114] border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200/60 dark:border-zinc-800/60 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Completed ({completedTasks.length})
                </h2>
              </div>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto">
              {completedTasks.map((task) => renderTaskCard(task))}
              {completedTasks.length === 0 && (
                <div className="py-12 text-center text-zinc-400 text-xs">No completed tasks yet</div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* LIST VIEW */
        <div className="p-5 rounded-xl bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800/80 shadow-xs divide-y divide-zinc-100 dark:divide-zinc-800/60">
          {filteredTasks.length === 0 ? (
            <div className="py-12 text-center text-zinc-400 text-xs">No tasks matching your filters.</div>
          ) : (
            filteredTasks.map((task) => {
              const isOverdue = task.status !== 'completed' && task.deadline < today;
              return (
                <div
                  key={task.id}
                  className="py-3 flex items-center justify-between gap-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => toggleTaskStatus(task.id)}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                        task.status === 'completed'
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-zinc-300 dark:border-zinc-700'
                      }`}
                    >
                      {task.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 fill-current" />}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-xs font-semibold ${
                            task.status === 'completed' ? 'line-through text-zinc-400' : 'text-zinc-900 dark:text-zinc-100'
                          }`}
                        >
                          {task.title}
                        </span>
                        {task.isTopThreeToday && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            Top 3
                          </span>
                        )}
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                          {task.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                        <span>{task.subject}</span>
                        <span>•</span>
                        <span className={isOverdue ? 'text-rose-500 font-semibold' : ''}>
                          Due {task.deadline}
                        </span>
                        <span>•</span>
                        <span>{task.estimatedMinutes}m est</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => toggleTopThree(task.id)}
                      className={`p-1 rounded ${
                        task.isTopThreeToday
                          ? 'text-amber-500'
                          : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                      }`}
                      title="Toggle Top 3 Priority"
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => openEditModal(task)}
                      className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-1 rounded text-zinc-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ADD / EDIT TASK MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-base font-bold mb-4">{editingTaskId ? 'Edit Task' : 'Add New Task'}</h3>
            <form onSubmit={handleSaveTask} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement Dijkstra Algorithm & write test cases"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Key sub-steps or references"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                    Subject / Tag
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Graph Theory"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TaskCategory)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="University">University</option>
                    <option value="Coding">Coding</option>
                    <option value="Projects">Projects</option>
                    <option value="Career">Career</option>
                    <option value="Personal">Personal</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                    Deadline
                  </label>
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-2 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                    Est. Minutes
                  </label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={estimatedMinutes}
                    onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="topThreeCheck"
                  checked={isTopThree}
                  onChange={(e) => setIsTopThree(e.target.checked)}
                  className="rounded text-emerald-500 focus:ring-emerald-500"
                />
                <label htmlFor="topThreeCheck" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Designate as Today's Top 3 Priority
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
                >
                  {editingTaskId ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  // Helper to render card for Kanban columns
  function renderTaskCard(task: Task) {
    const isOverdue = task.status !== 'completed' && task.deadline < today;
    return (
      <div
        key={task.id}
        className="p-3.5 rounded-lg bg-white dark:bg-[#17171c] border border-zinc-200 dark:border-zinc-800/90 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                task.priority === 'Urgent'
                  ? 'bg-rose-500/10 text-rose-500'
                  : task.priority === 'High'
                  ? 'bg-amber-500/10 text-amber-500'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
              }`}
            >
              {task.priority}
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-400">
              {task.category}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => toggleTopThree(task.id)}
              className={`p-1 rounded ${
                task.isTopThreeToday
                  ? 'text-amber-500'
                  : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
              }`}
              title="Pin to Today's Top 3"
            >
              <Pin className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => openEditModal(task)}
              className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => deleteTask(task.id)}
              className="p-1 rounded text-zinc-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <h3 className="text-xs font-semibold mt-2 text-zinc-900 dark:text-zinc-100 leading-snug">
          {task.title}
        </h3>

        {task.description && (
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-400">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{task.estimatedMinutes}m</span>
          </div>

          <span className={isOverdue ? 'text-rose-500 font-bold' : ''}>
            {task.deadline === today ? 'Today' : task.deadline}
          </span>
        </div>

        {/* Quick Column Shift Buttons */}
        <div className="mt-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800/40 flex items-center justify-between text-[10px]">
          {task.status !== 'todo' && (
            <button
              onClick={() => moveTaskStatus(task.id, 'todo')}
              className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            >
              ← To Do
            </button>
          )}

          {task.status !== 'in_progress' && (
            <button
              onClick={() => moveTaskStatus(task.id, 'in_progress')}
              className="text-indigo-500 font-medium hover:underline"
            >
              In Progress
            </button>
          )}

          {task.status !== 'completed' && (
            <button
              onClick={() => moveTaskStatus(task.id, 'completed')}
              className="text-emerald-500 font-medium hover:underline"
            >
              Done →
            </button>
          )}
        </div>
      </div>
    );
  }
};
