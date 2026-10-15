import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flame, Trophy, CheckCircle2, Clock, Plus, Sparkles, Calendar,
  AlertCircle, Timer, RefreshCw, ChevronRight, TrendingUp, Coffee,
  ArrowUpRight, Zap, BookOpen, CircleCheck, Play, Brain,
} from 'lucide-react';
import { useLevelUp } from '@/contexts/LevelUpContext';
import { QuickBreakModal } from '@/components/QuickBreakModal';

const MOTIVATIONAL_QUOTES = [
  { quote: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.', author: 'Will Durant' },
  { quote: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { quote: 'You do not rise to the level of your goals. You fall to the level of your systems.', author: 'James Clear' },
  { quote: 'Discipline is choosing between what you want now and what you want most.', author: 'Cal Newport' },
  { quote: 'Small disciplines repeated with consistency every day lead to great achievements gained slowly over time.', author: 'John C. Maxwell' },
];

export const DashboardPage: React.FC = () => {
  const {
    data, today, dailyCompletionPercentage, habitsCompletedToday, totalHabitsToday,
    studyTimeTodayHours, tasksCompletedToday, tasksRemainingToday, currentOverallStreak,
    longestOverallStreak, toggleHabitLog, isHabitDoneOnDate, toggleTaskStatus,
    getDailyRecord, addTask, logStudySession,
  } = useLevelUp();
  const navigate = useNavigate();
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newPriority, setNewPriority] = useState<'Urgent' | 'High' | 'Medium' | 'Low'>('High');
  const [newMinutes, setNewMinutes] = useState(45);
  const [showStudyModal, setShowStudyModal] = useState(false);
  const [studySubject, setStudySubject] = useState('Operating Systems');
  const [studyMinutes, setStudyMinutes] = useState(60);
  const [studyNotes, setStudyNotes] = useState('');
  const [showBreakModal, setShowBreakModal] = useState(false);

  const now = new Date();
  const hour = now.getHours();
  const greetingTime = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const formattedDate = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const topThreeTasks = data.tasks.filter((task) => task.isTopThreeToday).slice(0, 3);
  const activeHabits = data.habits.filter((habit) => !habit.archived).slice(0, 5);
  const upcomingExams = [...data.exams]
    .filter((exam) => exam.examDate >= today)
    .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime())
    .slice(0, 3);
  const todayRecord = getDailyRecord(today);
  const disciplineScore = todayRecord?.dailyScore ?? 0;
  const disciplineTotal = data.disciplineItems.filter((item) => item.active).length;
  const studyPercent = Math.min(100, Math.round((studyTimeTodayHours / studyTarget) * 100));

  const handleCreateTask = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newTitle.trim()) return;
    addTask({
      title: newTitle.trim(), subject: newSubject.trim() || 'General',
      category: 'University', priority: newPriority, status: 'todo', deadline: today,
      estimatedMinutes: Number(newMinutes) || 45, isTopThreeToday: true,
    });
    setNewTitle('');
    setNewSubject('');
    setShowTaskModal(false);
  };

  const handleLogStudy = (event: React.FormEvent) => {
    event.preventDefault();
    if (studyMinutes <= 0) return;
    const end = new Date();
    logStudySession({
      date: today,
      startTime: new Date(end.getTime() - studyMinutes * 60000).toISOString(),
      endTime: end.toISOString(),
      durationMinutes: Number(studyMinutes),
      subject: studySubject,
      sessionType: 'focus',
      notes: studyNotes,
    });
    setStudyNotes('');
    setShowStudyModal(false);
  };

  return (
    <div className="lu-dashboard">
      <section className="lu-welcome">
        <div className="lu-welcome-copy">
          <div className="lu-eyebrow"><span className="lu-live-dot" /> YOUR PERSONAL GROWTH SPACE <span className="lu-eyebrow-date"><Calendar size={13} /> {formattedDate}</span></div>
          <h1>{greetingTime}, <span>{data.profile.name || 'there'}.</span></h1>
          <p>Progress isn't built in a day. It's built by what you do today.</p>
        </div>
        <div className="lu-welcome-actions">
          <button className="lu-button lu-button-primary" onClick={() => navigate('/timer')}><Play size={15} fill="currentColor" /> Focus session</button>
          <button className="lu-button lu-button-ghost" onClick={() => setShowTaskModal(true)}><Plus size={15} /> New task</button>
        </div>
      </section>

      <section className="lu-bento-grid">
        <article className="lu-panel lu-momentum">
          <div className="lu-panel-top">
            <div><span className="lu-kicker">YOUR MOMENTUM</span><h2>Make today count.</h2></div>
            <span className="lu-icon-chip violet"><Zap size={18} /></span>
          </div>
          <div className="lu-momentum-body">
            <div className="lu-progress-ring" style={{ '--progress': `${dailyCompletionPercentage}%` } as React.CSSProperties}>
              <div className="lu-progress-inner"><strong>{dailyCompletionPercentage}<small>%</small></strong><span>completed</span></div>
            </div>
            <div className="lu-momentum-stats">
              <div className="lu-mini-stat"><span className="lu-mini-icon cyan"><BookOpen size={15} /></span><div><strong>{studyTimeTodayHours}h <small>/ {data.profile.dailyStudyTargetHours}h</small></strong><span>Study time</span></div></div>
              <div className="lu-mini-stat"><span className="lu-mini-icon violet"><CircleCheck size={15} /></span><div><strong>{habitsCompletedToday}<small> / {totalHabitsToday}</small></strong><span>Habits completed</span></div></div>
              <div className="lu-mini-stat"><span className="lu-mini-icon amber"><Flame size={15} /></span><div><strong>{currentOverallStreak}<small> day{currentOverallStreak === 1 ? '' : 's'}</small></strong><span>Current streak</span></div></div>
            </div>
          </div>
          <div className="lu-panel-foot"><span><TrendingUp size={14} /> Keep your streak alive</span><button onClick={() => navigate('/analytics')}>View insights <ArrowUpRight size={14} /></button></div>
        </article>

        <article className="lu-panel lu-focus-card">
          <div className="lu-focus-orb lu-orb-one" /><div className="lu-focus-orb lu-orb-two" />
          <div className="lu-panel-top"><span className="lu-kicker">THE NEXT 45 MINUTES</span><span className="lu-icon-chip cyan"><Timer size={18} /></span></div>
          <div className="lu-focus-content">
            <div className="lu-focus-label"><span className="lu-live-dot" /> DEEP WORK MODE</div>
            <h2>One thing.<br /><em>Full focus.</em></h2>
            <p>Protect a little time for the work that moves you forward.</p>
            <button className="lu-button lu-button-light" onClick={() => navigate('/timer')}>Start focus timer <ArrowUpRight size={16} /></button>
          </div>
          <div className="lu-focus-bottom"><span><Clock size={14} /> Your focus, your pace</span><span>01 / 01</span></div>
        </article>

        <article className="lu-panel lu-habits-card">
          <div className="lu-panel-top"><div><span className="lu-kicker">SMALL WINS, DAILY</span><h2>Habit check-in</h2></div><button className="lu-round-link" onClick={() => navigate('/habits')} aria-label="Manage habits"><ArrowUpRight size={17} /></button></div>
          <div className="lu-habit-summary"><div className="lu-habit-count"><strong>{habitsCompletedToday}<span>/{totalHabitsToday}</span></strong><span>done today</span></div><div className="lu-habit-track"><span style={{ width: `${totalHabitsToday ? (habitsCompletedToday / totalHabitsToday) * 100 : 0}%` }} /></div></div>
          {activeHabits.length === 0 ? <div className="lu-empty-state">Your next good habit starts here.<button onClick={() => navigate('/habits')}>Create a habit <ArrowUpRight size={13} /></button></div> :
            <div className="lu-habit-cloud">{activeHabits.map((habit) => {
              const done = isHabitDoneOnDate(habit.id, today);
              return <button key={habit.id} onClick={() => toggleHabitLog(habit.id, today)} className={`lu-habit-pill ${done ? 'is-done' : ''}`}><span className="lu-habit-check">{done && <CheckCircle2 size={14} />}</span>{habit.title}</button>;
            })}</div>}
          <div className="lu-panel-foot"><span>{disciplineScore}/{disciplineTotal} discipline checks</span><button onClick={() => navigate('/discipline')}>Discipline <ArrowUpRight size={14} /></button></div>
        </article>

        <article className="lu-panel lu-tasks-card">
          <div className="lu-panel-top"><div><span className="lu-kicker">MOVE THE NEEDLE</span><h2>Today's priorities</h2></div><button className="lu-round-link" onClick={() => navigate('/tasks')} aria-label="View all tasks"><ArrowUpRight size={17} /></button></div>
          <div className="lu-task-progress"><span>{tasksCompletedToday} completed</span><span>{tasksRemainingToday} to go</span></div>
          <div className="lu-task-track"><span style={{ width: `${tasksCompletedToday + tasksRemainingToday ? tasksCompletedToday / (tasksCompletedToday + tasksRemainingToday) * 100 : 0}%` }} /></div>
          <div className="lu-task-list">
            {topThreeTasks.length === 0 ? <div className="lu-empty-state">No priorities pinned for today yet.<button onClick={() => setShowTaskModal(true)}>Add your first task <Plus size={13} /></button></div> :
              topThreeTasks.map((task, index) => {
                const done = task.status === 'completed';
                return <div className={`lu-task-item ${done ? 'is-done' : ''}`} key={task.id}>
                  <button className="lu-task-toggle" onClick={() => toggleTaskStatus(task.id)} aria-label={done ? 'Mark task incomplete' : 'Complete task'}>{done && <CheckCircle2 size={15} />}</button>
                  <div className="lu-task-copy"><strong>{task.title}</strong><span>{task.subject || 'General'} · {task.estimatedMinutes} min</span></div>
                  <span className="lu-task-index">0{index + 1}</span>
                </div>;
              })}
          </div>
          <button className="lu-add-task" onClick={() => setShowTaskModal(true)}><Plus size={15} /> Add a priority</button>
        </article>

        <article className="lu-panel lu-exams-card">
          <div className="lu-panel-top"><div><span className="lu-kicker">WHAT'S COMING UP</span><h2>Countdowns</h2></div><span className="lu-icon-chip amber"><Calendar size={18} /></span></div>
          {upcomingExams.length === 0 ? <div className="lu-empty-state">No upcoming exams added.<button onClick={() => navigate('/exams')}>Plan your exams <ArrowUpRight size={13} /></button></div> :
            <div className="lu-exam-list">{upcomingExams.map((exam) => {
              const days = Math.ceil((new Date(exam.examDate).getTime() - new Date(today).getTime()) / 86400000);
              const total = exam.units.flatMap((unit) => unit.topics).length;
              const revised = exam.units.flatMap((unit) => unit.topics).filter((topic) => topic.status === 'revised').length;
              const percent = total ? Math.round((revised / total) * 100) : 0;
              return <button key={exam.id} className="lu-exam-item" onClick={() => navigate('/exams')}>
                <span className="lu-exam-date"><strong>{Math.max(0, days)}</strong><small>{days === 1 ? 'DAY LEFT' : 'DAYS LEFT'}</small></span>
                <span className="lu-exam-info"><strong>{exam.subject}</strong><span>{exam.examDate} · {percent}% revised</span><span className="lu-exam-track"><i style={{ width: `${percent}%` }} /></span></span>
                <ChevronRight size={16} />
              </button>;
            })}</div>}
          <div className="lu-panel-foot"><span><AlertCircle size={14} /> Stay ahead of deadlines</span><button onClick={() => navigate('/exams')}>Exam planner <ArrowUpRight size={14} /></button></div>
        </article>

        <article className="lu-panel lu-quote-card">
          <div className="lu-quote-decoration">“</div>
          <div className="lu-panel-top"><span className="lu-kicker"><Sparkles size={13} /> A THOUGHT TO KEEP</span><button className="lu-round-link" onClick={() => setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length)} aria-label="Next quote"><RefreshCw size={15} /></button></div>
          <blockquote>{MOTIVATIONAL_QUOTES[quoteIndex].quote}</blockquote>
          <div className="lu-quote-bottom"><span>— {MOTIVATIONAL_QUOTES[quoteIndex].author}</span><span className="lu-quote-stars"><Sparkles size={14} /></span></div>
          <div className="lu-intention"><span>TODAY'S INTENTION</span><p>{data.profile.dailyFocusIntention || 'Show up, focus on what matters, and let small wins add up.'}</p></div>
        </article>

        <article className="lu-panel lu-streak-card">
          <div className="lu-streak-art"><div className="lu-streak-glow" /><Flame size={30} /></div>
          <div className="lu-streak-copy"><span className="lu-kicker">CONSISTENCY IS POWER</span><strong>{currentOverallStreak}<small> day streak</small></strong><span><Trophy size={13} /> Personal best: {longestOverallStreak} days</span></div>
          <button className="lu-round-link" onClick={() => navigate('/history')} aria-label="View history"><ArrowUpRight size={17} /></button>
        </article>

        <article className="lu-panel lu-quick-card">
          <div><span className="lu-kicker">QUICK LAUNCH</span><h2>What do you need?</h2></div>
          <div className="lu-quick-actions">
            <button onClick={() => setShowStudyModal(true)}><span className="lu-quick-icon cyan"><Clock size={17} /></span><span><strong>Log study</strong><small>Record a session</small></span><ArrowUpRight size={14} /></button>
            <button onClick={() => setShowBreakModal(true)}><span className="lu-quick-icon violet"><Coffee size={17} /></span><span><strong>Take a break</strong><small>Reset your mind</small></span><ArrowUpRight size={14} /></button>
            <button onClick={() => navigate('/games')}><span className="lu-quick-icon amber"><Brain size={17} /></span><span><strong>Brain games</strong><small>Refresh your focus</small></span><ArrowUpRight size={14} /></button>
          </div>
        </article>
      </section>

      {showTaskModal && <div className="lu-modal-backdrop" role="presentation" onClick={() => setShowTaskModal(false)}><div className="lu-modal" role="dialog" aria-modal="true" aria-labelledby="lu-task-title" onClick={(event) => event.stopPropagation()}>
        <div className="lu-modal-head"><div><span className="lu-kicker">MAKE IT HAPPEN</span><h3 id="lu-task-title">Add a priority</h3></div><button className="lu-round-link" type="button" onClick={() => setShowTaskModal(false)}>×</button></div>
        <form onSubmit={handleCreateTask} className="lu-modal-form">
          <label>Task title<input required value={newTitle} onChange={(event) => setNewTitle(event.target.value)} placeholder="e.g. Revise data structures" autoFocus /></label>
          <div className="lu-form-two"><label>Subject / tag<input value={newSubject} onChange={(event) => setNewSubject(event.target.value)} placeholder="e.g. DSA" /></label><label>Priority<select value={newPriority} onChange={(event) => setNewPriority(event.target.value as typeof newPriority)}><option>Urgent</option><option>High</option><option>Medium</option><option>Low</option></select></label></div>
          <label>Estimated minutes<input type="number" min="5" step="5" value={newMinutes} onChange={(event) => setNewMinutes(Number(event.target.value))} /></label>
          <div className="lu-modal-actions"><button type="button" className="lu-button lu-button-ghost" onClick={() => setShowTaskModal(false)}>Cancel</button><button type="submit" className="lu-button lu-button-primary"><Plus size={15} /> Save task</button></div>
        </form>
      </div></div>}

      {showStudyModal && <div className="lu-modal-backdrop" role="presentation" onClick={() => setShowStudyModal(false)}><div className="lu-modal" role="dialog" aria-modal="true" aria-labelledby="lu-study-title" onClick={(event) => event.stopPropagation()}>
        <div className="lu-modal-head"><div><span className="lu-kicker">EVERY MINUTE COUNTS</span><h3 id="lu-study-title">Log a study session</h3></div><button className="lu-round-link" type="button" onClick={() => setShowStudyModal(false)}>×</button></div>
        <form onSubmit={handleLogStudy} className="lu-modal-form">
          <label>Subject / topic<input required value={studySubject} onChange={(event) => setStudySubject(event.target.value)} placeholder="What did you study?" /></label>
          <label>Duration in minutes<input type="number" required min="5" step="5" value={studyMinutes} onChange={(event) => setStudyMinutes(Number(event.target.value))} /></label>
          <label>Notes (optional)<textarea rows={3} value={studyNotes} onChange={(event) => setStudyNotes(event.target.value)} placeholder="What did you cover?" /></label>
          <div className="lu-modal-actions"><button type="button" className="lu-button lu-button-ghost" onClick={() => setShowStudyModal(false)}>Cancel</button><button type="submit" className="lu-button lu-button-primary"><CheckCircle2 size={15} /> Save session</button></div>
        </form>
      </div></div>}

      <QuickBreakModal isOpen={showBreakModal} onClose={() => setShowBreakModal(false)} />
    </div>
  );
};

export default DashboardPage;
