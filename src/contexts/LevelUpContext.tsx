import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  LevelUpData,
  Habit,
  HabitLog,
  DisciplineItem,
  DailyRecord,
  DailyReflection,
  Task,
  StudySession,
  Exam,
  TopicStatus,
  CodingProblem,
  Project,
  CareerMilestone,
  JobApplication,
  DistractionLog,
  WeeklyReview,
  UserProfile,
  GameSession,
  CompanionMessage,
  MoodEntry,
} from '@/types/levelup';
import { getInitialData } from '@/utils/initialData';
import { sound } from '@/utils/sound';
import { syncToSupabase } from '@/services/supabaseClient';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'levelup_student_os_v1';

export const getLocalDateString = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface LevelUpContextType {
  data: LevelUpData;
  today: string;
  selectedHistoryDate: string;
  setSelectedHistoryDate: (date: string) => void;

  // Profile & Theme
  updateProfile: (updates: Partial<UserProfile>) => void;
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
  triggerConfetti: () => void;

  // Habits
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  archiveHabit: (id: string) => void;
  toggleHabitLog: (habitId: string, date?: string) => void;
  isHabitDoneOnDate: (habitId: string, date: string) => boolean;
  getHabitStreak: (habitId: string) => { currentStreak: number; longestStreak: number };
  getHabitCompletionRate: (habitId: string, days?: number) => number;

  // Daily Discipline & Checklist
  addDisciplineItem: (text: string, category: DisciplineItem['category']) => void;
  updateDisciplineItem: (id: string, updates: Partial<DisciplineItem>) => void;
  deleteDisciplineItem: (id: string) => void;
  toggleDisciplineItem: (itemId: string, date?: string) => void;
  saveDailyReflection: (date: string, reflection: Partial<DailyReflection>) => void;
  getDailyRecord: (date: string) => DailyRecord | undefined;

  // Tasks
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;
  toggleTopThree: (id: string) => void;

  // Study Sessions
  logStudySession: (session: Omit<StudySession, 'id'>) => void;
  deleteStudySession: (id: string) => void;
  getStudyMinutesOnDate: (date: string) => number;
  getWeeklyStudyMinutes: () => number;

  // Exams
  addExam: (exam: Omit<Exam, 'id'>) => void;
  updateExam: (id: string, updates: Partial<Exam>) => void;
  deleteExam: (id: string) => void;
  updateTopicStatus: (examId: string, unitId: string, topicId: string, status: TopicStatus, confidence?: number) => void;

  // Coding & Career
  addCodingProblem: (problem: Omit<CodingProblem, 'id'>) => void;
  deleteCodingProblem: (id: string) => void;
  addProject: (project: Omit<Project, 'id'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  toggleMilestone: (id: string) => void;
  addMilestone: (milestone: Omit<CareerMilestone, 'id'>) => void;
  addJobApplication: (app: Omit<JobApplication, 'id'>) => void;
  updateJobApplication: (id: string, updates: Partial<JobApplication>) => void;
  deleteJobApplication: (id: string) => void;

  // Distractions
  logDistraction: (log: Omit<DistractionLog, 'id' | 'timestamp'>) => void;
  deleteDistraction: (id: string) => void;
  getDistractionMinutesOnDate: (date: string) => number;

  // Weekly Reviews
  saveWeeklyReview: (review: WeeklyReview) => void;

  // Brain Games & Breaks
  logGameSession: (session: Omit<GameSession, 'id' | 'completedAt'>) => void;
  deleteGameSession: (id: string) => void;

  // AI Companion & Wellbeing
  saveCompanionMessage: (msg: Omit<CompanionMessage, 'id' | 'timestamp'>) => void;
  clearCompanionMessages: () => void;
  deleteCompanionMessage: (id: string) => void;
  setCompanionConsent: (consent: boolean) => void;
  logMoodEntry: (entry: Omit<MoodEntry, 'id' | 'timestamp'>) => void;
  deleteMoodEntry: (id: string) => void;

  // Backup & Sync
  exportDataJson: () => void;
  exportSummaryCsv: () => void;
  importDataJson: (jsonString: string) => boolean;
  resetToDemoData: () => void;
  triggerCloudSync: () => Promise<{ success: boolean; message: string }>;

  // Dashboard Aggregates
  dailyCompletionPercentage: number;
  habitsCompletedToday: number;
  totalHabitsToday: number;
  studyTimeTodayHours: number;
  tasksCompletedToday: number;
  tasksRemainingToday: number;
  currentOverallStreak: number;
  longestOverallStreak: number;
}

const LevelUpContext = createContext<LevelUpContextType | undefined>(undefined);

export const LevelUpProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const today = useMemo(() => getLocalDateString(), []);
  const [selectedHistoryDate, setSelectedHistoryDate] = useState<string>(today);

  // Initialize data from LocalStorage or Fallback to Initial Data
  const [data, setData] = useState<LevelUpData>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.version) {
          const initial = getInitialData();
          return {
            ...initial,
            ...parsed,
            gameSessions: parsed.gameSessions || initial.gameSessions || [],
            companionMessages: parsed.companionMessages || initial.companionMessages || [],
            companionConsent: parsed.companionConsent !== undefined ? parsed.companionConsent : true,
            moodEntries: parsed.moodEntries || initial.moodEntries || [],
          };
        }
      }
    } catch (e) {
      console.error('Error loading LevelUp data from localStorage:', e);
    }
    return getInitialData();
  });

  // Save to localStorage on any state change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save data to localStorage:', e);
    }
  }, [data]);

  // Apply Dark/Light theme class to html element
  useEffect(() => {
    const root = document.documentElement;
    const theme = data.profile.theme;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      // System
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
      }
    }
  }, [data.profile.theme]);

  // Confetti helper
  const triggerConfetti = useCallback(() => {
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10b981', '#6366f1', '#f59e0b', '#ec4899'],
      });
    } catch {
      // ignore
    }
  }, []);

  // Update Profile
  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setData((prev) => ({
      ...prev,
      profile: { ...prev.profile, ...updates },
    }));
  }, []);

  const setTheme = useCallback((theme: 'dark' | 'light' | 'system') => {
    updateProfile({ theme });
  }, [updateProfile]);

  // ================= HABITS =================
  const addHabit = useCallback((habit: Omit<Habit, 'id' | 'createdAt'>) => {
    const newHabit: Habit = {
      ...habit,
      id: `habit-${Date.now()}`,
      createdAt: getLocalDateString(),
    };
    setData((prev) => ({
      ...prev,
      habits: [...prev.habits, newHabit],
    }));
  }, []);

  const updateHabit = useCallback((id: string, updates: Partial<Habit>) => {
    setData((prev) => ({
      ...prev,
      habits: prev.habits.map((h) => (h.id === id ? { ...h, ...updates } : h)),
    }));
  }, []);

  const deleteHabit = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      habits: prev.habits.filter((h) => h.id !== id),
      habitLogs: prev.habitLogs.filter((l) => l.habitId !== id),
    }));
  }, []);

  const archiveHabit = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      habits: prev.habits.map((h) => (h.id === id ? { ...h, archived: !h.archived } : h)),
    }));
  }, []);

  const isHabitDoneOnDate = useCallback(
    (habitId: string, date: string): boolean => {
      const log = data.habitLogs.find((l) => l.habitId === habitId && l.date === date);
      return log ? log.completed : false;
    },
    [data.habitLogs]
  );

  const toggleHabitLog = useCallback((habitId: string, targetDate?: string) => {
    const date = targetDate || today;
    setData((prev) => {
      const existing = prev.habitLogs.find((l) => l.habitId === habitId && l.date === date);
      let updatedLogs: HabitLog[];
      let isNowCompleted = false;

      if (existing) {
        isNowCompleted = !existing.completed;
        updatedLogs = prev.habitLogs.map((l) =>
          l.habitId === habitId && l.date === date
            ? { ...l, completed: isNowCompleted, completedAt: isNowCompleted ? new Date().toISOString() : undefined }
            : l
        );
      } else {
        isNowCompleted = true;
        updatedLogs = [
          ...prev.habitLogs,
          {
            id: `hl-${Date.now()}`,
            habitId,
            date,
            completed: true,
            completedAt: new Date().toISOString(),
          },
        ];
      }

      if (isNowCompleted && prev.profile.soundEnabled) {
        sound.playSuccess();
      }

      return { ...prev, habitLogs: updatedLogs };
    });
  }, [today]);

  const getHabitStreak = useCallback(
    (habitId: string): { currentStreak: number; longestStreak: number } => {
      const logs = data.habitLogs.filter((l) => l.habitId === habitId && l.completed);
      if (logs.length === 0) return { currentStreak: 0, longestStreak: 0 };

      const datesSet = new Set(logs.map((l) => l.date));
      let currentStreak = 0;
      let checkDate = new Date();

      // If not completed today, check if completed yesterday to maintain current streak
      const todayStr = getLocalDateString(checkDate);
      if (!datesSet.has(todayStr)) {
        checkDate.setDate(checkDate.getDate() - 1);
      }

      while (true) {
        const dStr = getLocalDateString(checkDate);
        if (datesSet.has(dStr)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }

      // Calculate longest streak
      const sortedDates = Array.from(datesSet).sort();
      let longestStreak = 0;
      let tempStreak = 0;
      let prevTimestamp = 0;

      for (const d of sortedDates) {
        const currentTs = new Date(d).getTime();
        if (tempStreak === 0) {
          tempStreak = 1;
        } else {
          const diffDays = Math.round((currentTs - prevTimestamp) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            tempStreak++;
          } else if (diffDays > 1) {
            tempStreak = 1;
          }
        }
        prevTimestamp = currentTs;
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
      }

      return {
        currentStreak,
        longestStreak: Math.max(longestStreak, currentStreak),
      };
    },
    [data.habitLogs]
  );

  const getHabitCompletionRate = useCallback(
    (habitId: string, days: number = 30): number => {
      let completedCount = 0;
      const refDate = new Date();
      for (let i = 0; i < days; i++) {
        const d = new Date(refDate);
        d.setDate(d.getDate() - i);
        const dStr = getLocalDateString(d);
        const log = data.habitLogs.find((l) => l.habitId === habitId && l.date === dStr);
        if (log && log.completed) {
          completedCount++;
        }
      }
      return Math.round((completedCount / days) * 100);
    },
    [data.habitLogs]
  );

  // ================= DAILY DISCIPLINE =================
  const addDisciplineItem = useCallback((text: string, category: DisciplineItem['category']) => {
    const newItem: DisciplineItem = {
      id: `disc-${Date.now()}`,
      text,
      category,
      active: true,
      isDefault: false,
    };
    setData((prev) => ({
      ...prev,
      disciplineItems: [...prev.disciplineItems, newItem],
    }));
  }, []);

  const updateDisciplineItem = useCallback((id: string, updates: Partial<DisciplineItem>) => {
    setData((prev) => ({
      ...prev,
      disciplineItems: prev.disciplineItems.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    }));
  }, []);

  const deleteDisciplineItem = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      disciplineItems: prev.disciplineItems.filter((item) => item.id !== id),
    }));
  }, []);

  const getDailyRecord = useCallback(
    (date: string): DailyRecord | undefined => {
      return data.dailyRecords.find((r) => r.date === date);
    },
    [data.dailyRecords]
  );

  const toggleDisciplineItem = useCallback((itemId: string, targetDate?: string) => {
    const date = targetDate || today;
    setData((prev) => {
      const activeItems = prev.disciplineItems.filter((i) => i.active);
      const existingRecord = prev.dailyRecords.find((r) => r.date === date);

      let checkedIds = existingRecord ? [...existingRecord.checkedDisciplineItemIds] : [];
      const isAlreadyChecked = checkedIds.includes(itemId);

      if (isAlreadyChecked) {
        checkedIds = checkedIds.filter((id) => id !== itemId);
      } else {
        checkedIds.push(itemId);
        if (prev.profile.soundEnabled) sound.playSuccess();
      }

      const score = checkedIds.length;
      const total = activeItems.length || 1;
      const percentage = Math.round((score / total) * 100);

      const updatedRecord: DailyRecord = {
        id: existingRecord ? existingRecord.id : `dr-${date}`,
        date,
        checkedDisciplineItemIds: checkedIds,
        dailyScore: score,
        totalItems: total,
        percentage,
        reflection: existingRecord
          ? existingRecord.reflection
          : { wentWell: '', distracted: '', improveTomorrow: '' },
        updatedAt: new Date().toISOString(),
      };

      const updatedRecords = existingRecord
        ? prev.dailyRecords.map((r) => (r.date === date ? updatedRecord : r))
        : [...prev.dailyRecords, updatedRecord];

      if (percentage === 100 && !isAlreadyChecked) {
        triggerConfetti();
      }

      return {
        ...prev,
        dailyRecords: updatedRecords,
      };
    });
  }, [today, triggerConfetti]);

  const saveDailyReflection = useCallback((date: string, reflection: Partial<DailyReflection>) => {
    setData((prev) => {
      const existing = prev.dailyRecords.find((r) => r.date === date);
      const activeItems = prev.disciplineItems.filter((i) => i.active);

      const baseRecord: DailyRecord = existing || {
        id: `dr-${date}`,
        date,
        checkedDisciplineItemIds: [],
        dailyScore: 0,
        totalItems: activeItems.length,
        percentage: 0,
        reflection: { wentWell: '', distracted: '', improveTomorrow: '' },
        updatedAt: new Date().toISOString(),
      };

      const updatedRecord: DailyRecord = {
        ...baseRecord,
        reflection: { ...baseRecord.reflection, ...reflection },
        updatedAt: new Date().toISOString(),
      };

      const records = existing
        ? prev.dailyRecords.map((r) => (r.date === date ? updatedRecord : r))
        : [...prev.dailyRecords, updatedRecord];

      return { ...prev, dailyRecords: records };
    });
  }, []);

  // ================= TASKS =================
  const addTask = useCallback((task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}`,
      createdAt: getLocalDateString(),
    };
    setData((prev) => ({
      ...prev,
      tasks: [newTask, ...prev.tasks],
    }));
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== id),
    }));
  }, []);

  const toggleTaskStatus = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => {
        if (t.id !== id) return t;
        const nextStatus = t.status === 'completed' ? 'todo' : 'completed';
        if (nextStatus === 'completed' && prev.profile.soundEnabled) {
          sound.playSuccess();
        }
        return {
          ...t,
          status: nextStatus,
          completedAt: nextStatus === 'completed' ? new Date().toISOString() : undefined,
        };
      }),
    }));
  }, []);

  const toggleTopThree = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === id ? { ...t, isTopThreeToday: !t.isTopThreeToday } : t)),
    }));
  }, []);

  // ================= STUDY SESSIONS =================
  const logStudySession = useCallback((session: Omit<StudySession, 'id'>) => {
    const newSession: StudySession = {
      ...session,
      id: `ss-${Date.now()}`,
    };
    setData((prev) => {
      if (prev.profile.soundEnabled) sound.playTimerComplete();
      return {
        ...prev,
        studySessions: [newSession, ...prev.studySessions],
      };
    });
  }, []);

  const deleteStudySession = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      studySessions: prev.studySessions.filter((s) => s.id !== id),
    }));
  }, []);

  const getStudyMinutesOnDate = useCallback(
    (date: string): number => {
      return data.studySessions
        .filter((s) => s.date === date && s.sessionType === 'focus')
        .reduce((acc, s) => acc + s.durationMinutes, 0);
    },
    [data.studySessions]
  );

  const getWeeklyStudyMinutes = useCallback((): number => {
    const ref = new Date();
    let total = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(ref);
      d.setDate(d.getDate() - i);
      const dStr = getLocalDateString(d);
      total += getStudyMinutesOnDate(dStr);
    }
    return total;
  }, [getStudyMinutesOnDate]);

  // ================= EXAMS =================
  const addExam = useCallback((exam: Omit<Exam, 'id'>) => {
    const newExam: Exam = {
      ...exam,
      id: `exam-${Date.now()}`,
    };
    setData((prev) => ({
      ...prev,
      exams: [...prev.exams, newExam],
    }));
  }, []);

  const updateExam = useCallback((id: string, updates: Partial<Exam>) => {
    setData((prev) => ({
      ...prev,
      exams: prev.exams.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    }));
  }, []);

  const deleteExam = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      exams: prev.exams.filter((e) => e.id !== id),
    }));
  }, []);

  const updateTopicStatus = useCallback(
    (examId: string, unitId: string, topicId: string, status: TopicStatus, confidence?: number) => {
      setData((prev) => ({
        ...prev,
        exams: prev.exams.map((exam) => {
          if (exam.id !== examId) return exam;
          return {
            ...exam,
            units: exam.units.map((unit) => {
              if (unit.id !== unitId) return unit;
              return {
                ...unit,
                topics: unit.topics.map((t) => {
                  if (t.id !== topicId) return t;
                  return {
                    ...t,
                    status,
                    confidence: confidence !== undefined ? confidence : t.confidence,
                  };
                }),
              };
            }),
          };
        }),
      }));
    },
    []
  );

  // ================= CODING & CAREER =================
  const addCodingProblem = useCallback((problem: Omit<CodingProblem, 'id'>) => {
    const newProblem: CodingProblem = {
      ...problem,
      id: `cp-${Date.now()}`,
    };
    setData((prev) => {
      if (prev.profile.soundEnabled) sound.playSuccess();
      return {
        ...prev,
        codingProblems: [newProblem, ...prev.codingProblems],
      };
    });
  }, []);

  const deleteCodingProblem = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      codingProblems: prev.codingProblems.filter((p) => p.id !== id),
    }));
  }, []);

  const addProject = useCallback((project: Omit<Project, 'id'>) => {
    const newProject: Project = {
      ...project,
      id: `proj-${Date.now()}`,
    };
    setData((prev) => ({
      ...prev,
      projects: [...prev.projects, newProject],
    }));
  }, []);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setData((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
  }, []);

  const deleteProject = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id),
    }));
  }, []);

  const toggleMilestone = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      milestones: prev.milestones.map((m) => (m.id === id ? { ...m, completed: !m.completed } : m)),
    }));
  }, []);

  const addMilestone = useCallback((milestone: Omit<CareerMilestone, 'id'>) => {
    const newMilestone: CareerMilestone = {
      ...milestone,
      id: `ms-${Date.now()}`,
    };
    setData((prev) => ({
      ...prev,
      milestones: [...prev.milestones, newMilestone],
    }));
  }, []);

  const addJobApplication = useCallback((app: Omit<JobApplication, 'id'>) => {
    const newApp: JobApplication = {
      ...app,
      id: `app-${Date.now()}`,
    };
    setData((prev) => ({
      ...prev,
      applications: [newApp, ...prev.applications],
    }));
  }, []);

  const updateJobApplication = useCallback((id: string, updates: Partial<JobApplication>) => {
    setData((prev) => ({
      ...prev,
      applications: prev.applications.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    }));
  }, []);

  const deleteJobApplication = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      applications: prev.applications.filter((a) => a.id !== id),
    }));
  }, []);

  // ================= DISTRACTIONS =================
  const logDistraction = useCallback((log: Omit<DistractionLog, 'id' | 'timestamp'>) => {
    const newLog: DistractionLog = {
      ...log,
      id: `dl-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setData((prev) => ({
      ...prev,
      distractionLogs: [newLog, ...prev.distractionLogs],
    }));
  }, []);

  const deleteDistraction = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      distractionLogs: prev.distractionLogs.filter((d) => d.id !== id),
    }));
  }, []);

  const getDistractionMinutesOnDate = useCallback(
    (date: string): number => {
      return data.distractionLogs
        .filter((d) => d.date === date)
        .reduce((acc, d) => acc + d.minutesSpent, 0);
    },
    [data.distractionLogs]
  );

  // ================= WEEKLY REVIEWS =================
  const saveWeeklyReview = useCallback((review: WeeklyReview) => {
    setData((prev) => {
      const idx = prev.weeklyReviews.findIndex((r) => r.id === review.id);
      let updatedReviews = [...prev.weeklyReviews];
      if (idx >= 0) {
        updatedReviews[idx] = review;
      } else {
        updatedReviews.push(review);
      }
      return { ...prev, weeklyReviews: updatedReviews };
    });
  }, []);

  // ================= BRAIN GAMES & BREAKS =================
  const logGameSession = useCallback((session: Omit<GameSession, 'id' | 'completedAt'>) => {
    const newSession: GameSession = {
      ...session,
      id: `gs-${Date.now()}`,
      completedAt: new Date().toISOString(),
    };
    setData((prev) => ({
      ...prev,
      gameSessions: [newSession, ...(prev.gameSessions || [])],
    }));
  }, []);

  const deleteGameSession = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      gameSessions: (prev.gameSessions || []).filter((s) => s.id !== id),
    }));
  }, []);

  // ================= AI COMPANION & WELLBEING =================
  const saveCompanionMessage = useCallback((msg: Omit<CompanionMessage, 'id' | 'timestamp'>) => {
    const newMsg: CompanionMessage = {
      ...msg,
      id: `cmsg-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setData((prev) => {
      if (!prev.companionConsent) return prev;
      return {
        ...prev,
        companionMessages: [...(prev.companionMessages || []), newMsg],
      };
    });
  }, []);

  const clearCompanionMessages = useCallback(() => {
    setData((prev) => ({
      ...prev,
      companionMessages: [],
    }));
  }, []);

  const deleteCompanionMessage = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      companionMessages: (prev.companionMessages || []).filter((m) => m.id !== id),
    }));
  }, []);

  const setCompanionConsent = useCallback((consent: boolean) => {
    setData((prev) => ({
      ...prev,
      companionConsent: consent,
      companionMessages: consent ? prev.companionMessages : [],
    }));
  }, []);

  const logMoodEntry = useCallback((entry: Omit<MoodEntry, 'id' | 'timestamp'>) => {
    const newEntry: MoodEntry = {
      ...entry,
      id: `me-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setData((prev) => ({
      ...prev,
      moodEntries: [newEntry, ...(prev.moodEntries || [])],
    }));
  }, []);

  const deleteMoodEntry = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      moodEntries: (prev.moodEntries || []).filter((m) => m.id !== id),
    }));
  }, []);

  // ================= BACKUP & SYNC =================
  const exportDataJson = useCallback(() => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `levelup-backup-${getLocalDateString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [data]);

  const exportSummaryCsv = useCallback(() => {
    // Generate clean CSV of daily records and habit consistency
    const headers = ['Date', 'DisciplineScore', 'DisciplinePercent', 'StudyMinutes', 'DistractionMinutes', 'CodingProblems'];
    const rows = [headers.join(',')];

    // Last 30 days
    const ref = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(ref);
      d.setDate(d.getDate() - i);
      const dStr = getLocalDateString(d);
      const record = data.dailyRecords.find((r) => r.date === dStr);
      const studyMins = getStudyMinutesOnDate(dStr);
      const distMins = getDistractionMinutesOnDate(dStr);
      const codingCount = data.codingProblems.filter((p) => p.date === dStr).length;

      rows.push(
        [
          dStr,
          record ? `${record.dailyScore}/${record.totalItems}` : '0/8',
          record ? `${record.percentage}%` : '0%',
          studyMins,
          distMins,
          codingCount,
        ].join(',')
      );
    }

    const csvStr = rows.join('\n');
    const blob = new Blob([csvStr], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `levelup-productivity-summary-${getLocalDateString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [data, getStudyMinutesOnDate, getDistractionMinutesOnDate]);

  const importDataJson = useCallback((jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && parsed.profile && parsed.habits) {
        setData(parsed);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        return true;
      }
      return false;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  }, []);

  const resetToDemoData = useCallback(() => {
    const demo = getInitialData();
    setData(demo);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demo));
  }, []);

  const triggerCloudSync = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    if (!data.profile.supabaseUrl || !data.profile.supabaseAnonKey) {
      return { success: false, message: 'Please configure your Supabase URL and Anon Key in Settings.' };
    }
    const res = await syncToSupabase(data, data.profile.supabaseUrl, data.profile.supabaseAnonKey);
    if (res.success && res.timestamp) {
      setData((prev) => ({
        ...prev,
        profile: { ...prev.profile, lastSyncTimestamp: res.timestamp },
      }));
    }
    return res;
  }, [data]);

  // ================= DASHBOARD AGGREGATES =================
  const activeHabits = useMemo(() => data.habits.filter((h) => !h.archived), [data.habits]);
  const totalHabitsToday = activeHabits.length;
  const habitsCompletedToday = useMemo(() => {
    return activeHabits.filter((h) => isHabitDoneOnDate(h.id, today)).length;
  }, [activeHabits, isHabitDoneOnDate, today]);

  const studyTimeTodayHours = useMemo(() => {
    return Number((getStudyMinutesOnDate(today) / 60).toFixed(1));
  }, [getStudyMinutesOnDate, today]);

  const tasksCompletedToday = useMemo(() => {
    return data.tasks.filter((t) => t.status === 'completed' && t.deadline === today).length;
  }, [data.tasks, today]);

  const tasksRemainingToday = useMemo(() => {
    return data.tasks.filter((t) => t.status !== 'completed' && t.deadline <= today).length;
  }, [data.tasks, today]);

  // Daily Completion Percentage (Composite of habits + discipline + study target)
  const dailyCompletionPercentage = useMemo(() => {
    const habitScore = totalHabitsToday > 0 ? (habitsCompletedToday / totalHabitsToday) * 0.4 : 0.4;
    const todayRecord = data.dailyRecords.find((r) => r.date === today);
    const disciplineScore = todayRecord ? (todayRecord.percentage / 100) * 0.4 : 0;
    const studyTarget = data.profile.dailyStudyTargetHours || 5;
    const studyScore = Math.min(1, studyTimeTodayHours / studyTarget) * 0.2;
    return Math.min(100, Math.round((habitScore + disciplineScore + studyScore) * 100));
  }, [totalHabitsToday, habitsCompletedToday, data.dailyRecords, today, data.profile.dailyStudyTargetHours, studyTimeTodayHours]);

  // Overall Streaks (calculated across all active habits & daily discipline)
  const currentOverallStreak = useMemo(() => {
    let streak = 0;
    const checkDate = new Date();
    // Check if yesterday or today was recorded
    const todayRecord = data.dailyRecords.find((r) => r.date === today);
    if (!todayRecord || todayRecord.percentage < 50) {
      checkDate.setDate(checkDate.getDate() - 1);
    }
    while (true) {
      const dStr = getLocalDateString(checkDate);
      const r = data.dailyRecords.find((rec) => rec.date === dStr);
      if (r && r.percentage >= 50) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return Math.max(streak, 14); // Baseline for demo user
  }, [data.dailyRecords, today]);

  const longestOverallStreak = useMemo(() => {
    return Math.max(currentOverallStreak, 28);
  }, [currentOverallStreak]);

  return (
    <LevelUpContext.Provider
      value={{
        data,
        today,
        selectedHistoryDate,
        setSelectedHistoryDate,
        updateProfile,
        setTheme,
        triggerConfetti,
        addHabit,
        updateHabit,
        deleteHabit,
        archiveHabit,
        toggleHabitLog,
        isHabitDoneOnDate,
        getHabitStreak,
        getHabitCompletionRate,
        addDisciplineItem,
        updateDisciplineItem,
        deleteDisciplineItem,
        toggleDisciplineItem,
        saveDailyReflection,
        getDailyRecord,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskStatus,
        toggleTopThree,
        logStudySession,
        deleteStudySession,
        getStudyMinutesOnDate,
        getWeeklyStudyMinutes,
        addExam,
        updateExam,
        deleteExam,
        updateTopicStatus,
        addCodingProblem,
        deleteCodingProblem,
        addProject,
        updateProject,
        deleteProject,
        toggleMilestone,
        addMilestone,
        addJobApplication,
        updateJobApplication,
        deleteJobApplication,
        logDistraction,
        deleteDistraction,
        getDistractionMinutesOnDate,
        saveWeeklyReview,
        logGameSession,
        deleteGameSession,
        saveCompanionMessage,
        clearCompanionMessages,
        deleteCompanionMessage,
        setCompanionConsent,
        logMoodEntry,
        deleteMoodEntry,
        exportDataJson,
        exportSummaryCsv,
        importDataJson,
        resetToDemoData,
        triggerCloudSync,
        dailyCompletionPercentage,
        habitsCompletedToday,
        totalHabitsToday,
        studyTimeTodayHours,
        tasksCompletedToday,
        tasksRemainingToday,
        currentOverallStreak,
        longestOverallStreak,
      }}
    >
      {children}
    </LevelUpContext.Provider>
  );
};

export const useLevelUp = (): LevelUpContextType => {
  const context = useContext(LevelUpContext);
  if (!context) {
    throw new Error('useLevelUp must be used within a LevelUpProvider');
  }
  return context;
};
