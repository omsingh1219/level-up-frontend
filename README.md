# LEVEL UP — Student Productivity & Discipline Platform

**LEVEL UP** is a modern, responsive, fully functional student productivity web platform designed to help students improve discipline, break distracting habits, manage academic schedules, track coding progress, prepare for exams, and achieve career goals.

Inspired by Notion and Linear, it combines a habit tracker, student planner, deep work timer, distraction journal, brain games, and an empathetic AI companion.

---

## 🚀 Quick Start

### 1. Start Development Server
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

### 2. Run Tests
```bash
npm test
```

### 3. Production Build
```bash
npm run build
```

---

## 🌟 Modules & Features

1. **Dashboard Overview (`/`)**
   - Daily completion gauge, habit counters, study time vs. target, streaks, top 3 priorities, upcoming exams, and inspirational quotes.
   - Quick Action buttons: Add Task, Log Study Time, Pomodoro, and Quick Break.

2. **Habit Tracker (`/habits`)**
   - Daily/weekly frequencies, current and longest streak calculations, calendar heatmap, category tags, completion analytics.

3. **Daily Discipline Checklist (`/discipline`)**
   - Non-negotiable standards (No short-form video reels, 90m focused study, daily coding problem, physical exercise, phone away).
   - Non-judgmental streak tracking and daily reflections (*What went well?*, *What distracted me?*, *What will I improve tomorrow?*).

4. **Task Manager & Kanban (`/tasks`)**
   - Dual-view list and interactive Kanban board (`To Do`, `In Progress`, `Completed`).
   - Subject tags, priorities, overdue indicators, and estimated durations.

5. **Focus Pomodoro Timer (`/timer`)**
   - 25-minute Pomodoro with short (5 min) and long (15 min) breaks.
   - Subject and task tagging, session history logging, and audio notifications.

6. **Exam Preparation Planner (`/exams`)**
   - Subject management, countdowns, unit/syllabus breakdown, confidence ratings (Low, Medium, Mastered), and revision status.

7. **Brain Games & Quick Breaks (`/games`)**
   - 6 playable games & offline rest guides:
     - **Memory Match**: 4x4 card matching.
     - **Sudoku**: Playable 9x9 with Easy/Medium/Hard and hints.
     - **Reaction Time Test**: Millisecond precision with 5-round average.
     - **Word Scramble**: Academic and CS vocabulary with clues.
     - **Logic Puzzles**: Classic algorithmic and lateral thinking puzzles.
     - **Calm Breathing**: Animated Box Breathing (4-4-4-4) & 4-7-8 modes.
     - **Non-Screen Break Guide**: 20-20-20 rule, hydration, and physical mobility.

8. **AI Companion (`/companion`)**
   - Three conversation modes:
     - *"I just want to talk"* (non-judgmental listening, no toxic positivity)
     - *"Help me understand this"* (untangles complex academic burnout)
     - *"Help me make a plan"* (2-3 manageable, grounded steps)
   - Real-time crisis detection routing to verified public hotlines (US 988, UK 111/116 123, India 14416/Tele-MANAS, FindAHelpline).
   - Strict privacy: explicit opt-in history saving, local data isolation, zero client key exposure.

9. **Coding Practice Tracker (`/coding`)**
   - Tracks LeetCode/HackerRank problems by platform, difficulty, topic tags, and code solutions.

10. **Career & Project Tracker (`/career`)**
    - Project portfolio milestone tracker and job/internship application pipeline.

11. **Distraction & Urge Journal (`/distractions`)**
    - Log digital distractions, triggers, alternatives taken, and build self-awareness without shame.

12. **Weekly Analytics & Review (`/analytics`)**
    - Visual bar charts, category breakdowns, study efficiency metrics, and consistency scoring.

13. **History Calendar (`/history`)**
    - Complete timeline view of daily discipline scores and historical notes.

14. **Settings & Profile (`/settings`)**
    - Dark/Light mode, daily study targets, college & graduation year, cloud sync preferences.

---

## 🔐 Environment Variables (`.env`)
To enable live AI inference in the AI Companion:
```env
# Google Gemini (Recommended)
GEMINI_API_KEY="your-gemini-api-key"

# OR OpenAI
OPENAI_API_KEY="your-openai-api-key"
```
*Note: API keys are securely processed server-side in Vite and are never leaked to frontend JavaScript bundles.*
