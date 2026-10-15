export type Priority = 'Urgent' | 'High' | 'Medium' | 'Low';
export type TaskCategory = 'University' | 'Coding' | 'Projects' | 'Career' | 'Personal';
export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export interface Task {
  id: string;
  title: string;
  description?: string;
  subject?: string;
  category: TaskCategory;
  priority: Priority;
  status: TaskStatus;
  deadline: string; // YYYY-MM-DD
  estimatedMinutes: number;
  isTopThreeToday: boolean;
  completedAt?: string;
  createdAt: string;
}

export type HabitCategory = 'Study' | 'Coding' | 'Fitness' | 'Mindset' | 'Health' | 'Digital Detox';
export type HabitFrequency = 'daily' | 'weekdays' | 'custom';

export interface Habit {
  id: string;
  title: string;
  description?: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  targetDaysPerWeek: number; // e.g. 7 for daily, 5 for weekdays, or custom count
  selectedWeekdays?: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  color: string; // Tailwind color token or hex
  icon: string;
  archived: boolean;
  createdAt: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  completedAt?: string;
}

export interface DisciplineItem {
  id: string;
  text: string;
  category: 'detox' | 'study' | 'coding' | 'health' | 'routine';
  active: boolean;
  isDefault?: boolean;
}

export interface DailyReflection {
  wentWell: string;
  distracted: string;
  improveTomorrow: string;
}

export interface DailyRecord {
  id: string;
  date: string; // YYYY-MM-DD
  checkedDisciplineItemIds: string[];
  dailyScore: number;
  totalItems: number;
  percentage: number;
  reflection: DailyReflection;
  notes?: string;
  updatedAt: string;
}

export type SessionType = 'focus' | 'short_break' | 'long_break';

export interface StudySession {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // ISO
  endTime: string; // ISO
  durationMinutes: number;
  subject: string;
  taskId?: string;
  sessionType: SessionType;
  notes?: string;
}

export type TopicStatus = 'not_started' | 'learning' | 'revised';

export interface Topic {
  id: string;
  name: string;
  status: TopicStatus;
  confidence: number; // 1-5
  notes?: string;
}

export interface Unit {
  id: string;
  title: string;
  topics: Topic[];
}

export interface Exam {
  id: string;
  subject: string;
  code?: string;
  examDate: string; // YYYY-MM-DD
  examTime: string; // e.g. 09:30 AM
  targetGrade?: string;
  color?: string;
  units: Unit[];
}

export type CodingPlatform = 'LeetCode' | 'Codeforces' | 'HackerRank' | 'NeetCode' | 'GFG' | 'CodeChef' | 'Other';
export type CodingDifficulty = 'Easy' | 'Medium' | 'Hard';
export type DsaTopic = 
  | 'Arrays'
  | 'Strings'
  | 'Two Pointers'
  | 'Sliding Window'
  | 'Linked Lists'
  | 'Stacks & Queues'
  | 'Trees'
  | 'Graphs'
  | 'Dynamic Programming'
  | 'Binary Search'
  | 'Heap & Priority Queue'
  | 'Backtracking'
  | 'Greedy'
  | 'Bit Manipulation'
  | 'Tries'
  | 'Math & Geometry'
  | 'Other';

export interface CodingProblem {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  platform: CodingPlatform;
  difficulty: CodingDifficulty;
  topic: DsaTopic;
  problemUrl?: string;
  solutionNotes?: string;
  timeSpentMinutes?: number;
}

export type ProjectStatus = 'Idea' | 'In Progress' | 'Completed' | 'Published';

export interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
  status: ProjectStatus;
  completionPercentage: number;
  startDate?: string;
}

export type MilestoneCategory = 'DSA' | 'Projects' | 'Resume' | 'Internships' | 'Interviews';

export interface CareerMilestone {
  id: string;
  title: string;
  category: MilestoneCategory;
  completed: boolean;
  targetDate?: string;
}

export type ApplicationStatus = 'Bookmarked' | 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Rejected';

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  applicationDate: string; // YYYY-MM-DD
  status: ApplicationStatus;
  salary?: string;
  location?: string;
  notes?: string;
  link?: string;
}

export type DistractionActivity = 
  | 'Instagram Reels'
  | 'YouTube Shorts'
  | 'TikTok'
  | 'Gaming (BGMI/Valorant)'
  | 'Twitter / X'
  | 'Reddit Doomscroll'
  | 'Streaming / Netflix'
  | 'Random Web Browsing'
  | 'Other';

export type DistractionTrigger = 'Boredom' | 'Stress' | 'Procrastination' | 'Loneliness' | 'Fatigue' | 'Autopilot Habit';

export interface DistractionLog {
  id: string;
  date: string; // YYYY-MM-DD
  activity: DistractionActivity;
  minutesSpent: number;
  urgeLevel: number; // 1-5
  trigger: DistractionTrigger;
  isIntentionalRecreation: boolean;
  notes?: string;
  timestamp: string;
}

export interface WeeklyGoal {
  id: string;
  text: string;
  completed: boolean;
}

export interface WeeklyReview {
  id: string; // e.g. "2026-W42"
  weekNumber: number;
  year: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  win: string;
  obstacle: string;
  focusNextWeek: string;
  nextWeekGoals: WeeklyGoal[];
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  college: string;
  major: string;
  year: string;
  semester: string;
  targetGpa: string;
  dailyStudyTargetHours: number;
  dailyCodingGoal: number;
  defaultPomodoroFocus: number;
  defaultPomodoroShortBreak: number;
  defaultPomodoroLongBreak: number;
  soundEnabled: boolean;
  theme: 'dark' | 'light' | 'system';
  dailyFocusIntention: string;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  cloudSyncEnabled: boolean;
  lastSyncTimestamp?: string;
}

export type GameType = 'memory' | 'sudoku' | 'reaction' | 'word_scramble' | 'logic_puzzle' | 'breathing';

export interface GameSession {
  id: string;
  gameType: GameType;
  gameTitle: string;
  date: string; // YYYY-MM-DD
  durationSeconds: number;
  score: number | string;
  difficulty?: string;
  notes?: string;
  completedAt: string;
}

export type CompanionMode = 'talk' | 'understand' | 'plan';

export interface CompanionMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  mode: CompanionMode;
  isCrisisHelp?: boolean;
}

export type MoodType = 'Overwhelmed' | 'Anxious' | 'Exhausted' | 'Neutral' | 'Focused' | 'Hopeful';

export interface MoodEntry {
  id: string;
  date: string; // YYYY-MM-DD
  timestamp: string;
  mood: MoodType;
  energyLevel: number; // 1-5
  note?: string;
}

export interface LevelUpData {
  version: number;
  profile: UserProfile;
  habits: Habit[];
  habitLogs: HabitLog[];
  disciplineItems: DisciplineItem[];
  dailyRecords: DailyRecord[];
  tasks: Task[];
  studySessions: StudySession[];
  exams: Exam[];
  codingProblems: CodingProblem[];
  projects: Project[];
  milestones: CareerMilestone[];
  applications: JobApplication[];
  distractionLogs: DistractionLog[];
  weeklyReviews: WeeklyReview[];
  gameSessions: GameSession[];
  companionMessages: CompanionMessage[];
  companionConsent: boolean;
  moodEntries: MoodEntry[];
}

